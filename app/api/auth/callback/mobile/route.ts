import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import { completeAuth, getRequestMetadata } from '@/lib/auth';

/**
 * Mobile OAuth callback endpoint for native apps (Android/KMP).
 *
 * The Android app initiates OAuth by building the auth URL and opening it in Chrome Custom Tab.
 * WorkOS redirects to this endpoint with ?code=...&state=...
 * This endpoint:
 *   1. Exchanges the code for a WorkOS session (using code_verifier from state or params)
 *   2. Creates a local session
 *   3. Returns the session cookie value as JSON (not a redirect)
 *
 * The Android app parses the JSON response and stores the session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 });
  }

  // The state param carries the code_verifier (for PKCE)
  // Also accept code_verifier as a separate query param for flexibility
  const codeVerifier = state || searchParams.get('code_verifier');

  if (!codeVerifier) {
    return NextResponse.json({ error: 'missing_code_verifier' }, { status: 400 });
  }

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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    // Also set the session cookie on the response for client-side consumption
    response.cookies.set('session', sessionId, {
      httpOnly: false, // Allow client JS to read (for hybrid scenarios)
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

  const code = body.code || new URL(request.url).searchParams.get('code');
  const codeVerifier = body.code_verifier || body.state;

  if (!code || !codeVerifier) {
    return NextResponse.json({ error: 'missing_code_or_verifier' }, { status: 400 });
  }

  return GET(request);
}