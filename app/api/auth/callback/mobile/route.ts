import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { completeAuth, getRequestMetadata } from '@/lib/auth';

/**
 * Mobile OAuth callback / ID token verification endpoint for native apps (Android/KMP).
 *
 * Supports two flows:
 * 1. Native Credential Manager (Google ID token): id_token passed directly
 * 2. Custom Tab OAuth (PKCE): code + code_verifier passed
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // ID token from native Credential Manager sign-in
  const idToken = searchParams.get('id_token');
  // code + code_verifier from Custom Tab OAuth flow
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const codeVerifier = state || searchParams.get('code_verifier');

  if (!code && !idToken) {
    return NextResponse.json({ error: 'missing_code_or_id_token' }, { status: 400 });
  }

  if (idToken) {
    // --- Native Credential Manager flow: verify Google ID token directly ---
    try {
      const result = await workos.userManagement.authenticateWithGoogleToken({
        googleOAuthClientId: process.env.WORKOS_CLIENT_ID!,
        idToken,
        ...getRequestMetadata(request),
      });

      if (!result.user) {
        return NextResponse.json({ error: 'invalid_id_token' }, { status: 400 });
      }

      const { user, sessionId } = await completeAuth({
        workosUser: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          profilePictureUrl: result.user.profilePictureUrl ?? null,
        },
      });

      const response = NextResponse.json({
        success: true,
        session: sessionId,
        user: { id: user.id, email: user.email, name: user.name },
      });
      response.cookies.set('session', sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Mobile ID token auth error:', error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (code && codeVerifier) {
    // --- Custom Tab OAuth PKCE flow ---
    try {
      const result = await workos.userManagement.authenticateWithCode({
        clientId: process.env.WORKOS_CLIENT_ID!,
        code,
        codeVerifier,
        ...getRequestMetadata(request),
      });

      if (!result.user) {
        return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
      }

      const { user, sessionId } = await completeAuth({
        workosUser: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          profilePictureUrl: result.user.profilePictureUrl ?? null,
        },
      });

      const response = NextResponse.json({
        success: true,
        session: sessionId,
        user: { id: user.id, email: user.email, name: user.name },
      });
      response.cookies.set('session', sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Mobile OAuth callback error:', error);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';
  let body: Record<string, string> = {};

  if (contentType.includes('application/json')) {
    body = await request.json();
  } else {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      body[key] = String(value);
    }
  }

  const idToken = body.id_token || new URL(request.url).searchParams.get('id_token');
  const code = body.code || new URL(request.url).searchParams.get('code');
  const codeVerifier = body.code_verifier || body.state;

  if (!code && !idToken) {
    return NextResponse.json({ error: 'missing_code_or_id_token' }, { status: 400 });
  }

  if (idToken) {
    const getReq = new NextRequest(request.url, {
      headers: { 'content-type': 'application/json' },
      method: 'GET',
    });
    getReq.nextUrl.searchParams.set('id_token', idToken);
    return GET(getReq);
  }

  if (code && codeVerifier) {
    const getReq = new NextRequest(request.url, {
      headers: { 'content-type': 'application/json' },
      method: 'GET',
    });
    getReq.nextUrl.searchParams.set('code', code);
    getReq.nextUrl.searchParams.set('code_verifier', codeVerifier);
    return GET(getReq);
  }

  return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
}
