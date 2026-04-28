import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos';
import {
  getRequestMetadata,
  normalizeEmail,
  acceptPendingInvites,
  createLocalSession,
  completeAuth,
  type WorkOSUserProfile,
  type LocalUserRecord,
} from '@/lib/auth';
import sql from '@/lib/db';

const GOOGLE_OAUTH_CLIENT_ID =
  process.env.GOOGLE_OAUTH_CLIENT_ID ??
  '825418709361-735b2af8nb1id51dpeinsckq95gemq7r.apps.googleusercontent.com';

const googleAuthClient = new OAuth2Client();

async function verifyGoogleIdToken(idToken: string) {
  const ticket = await googleAuthClient.verifyIdToken({
    idToken,
    audience: GOOGLE_OAUTH_CLIENT_ID,
  });
  return ticket.getPayload()!;
}

async function syncLocalUserFromGoogleProfile(
  payload: { sub: string; email: string; name: string; picture?: string }
): Promise<LocalUserRecord> {
  const email = normalizeEmail(payload.email);
  const name = payload.name || email.split('@')[0];

  const [existing] = await sql<LocalUserRecord[]>`
    SELECT id, email, name, invite_pending
    FROM users
    WHERE LOWER(email) = ${email}
  `;

  if (existing) {
    const [updated] = await sql<LocalUserRecord[]>`
      UPDATE users
      SET
        name = ${name},
        google_id = ${payload.sub},
        profile_image_url = COALESCE(${payload.picture ?? null}, profile_image_url)
      WHERE id = ${existing.id}
      RETURNING id, email, name, invite_pending
    `;
    return updated;
  }

  const [created] = await sql<LocalUserRecord[]>`
    INSERT INTO users (email, name, password_hash, google_id, profile_image_url)
    VALUES (${email}, ${name}, NULL, ${payload.sub}, ${payload.picture ?? null})
    RETURNING id, email, name, invite_pending
  `;
  return created;
}

function attachSession(response: NextResponse, sessionId: string) {
  response.cookies.set('session', sessionId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const idToken = searchParams.get('id_token');
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const codeVerifier = state || searchParams.get('code_verifier');

  if (!code && !idToken) {
    return NextResponse.json({ error: 'missing_code_or_id_token' }, { status: 400 });
  }

  if (idToken) {
    // --- Native Credential Manager flow: verify Google ID token directly ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;
    try {
      payload = await verifyGoogleIdToken(idToken);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Google ID token verification failed:', message);
      return NextResponse.json(
        { error: 'invalid_id_token', detail: message },
        { status: 401 }
      );
    }

    if (!payload.email) {
      return NextResponse.json({ error: 'email_not_in_token' }, { status: 400 });
    }

    try {
      const workosUser: WorkOSUserProfile = {
        id: payload.sub,
        email: payload.email,
        firstName: payload.name?.split(' ')[0] ?? null,
        lastName: payload.name?.split(' ').slice(1).join(' ') || null,
        profilePictureUrl: payload.picture ?? null,
      };

      // Sync local user (create or update by email, store google_id = payload.sub)
      const localUser = await syncLocalUserFromGoogleProfile({
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });

      // Accept any pending invites for this email
      const bookId = await acceptPendingInvites(workosUser.email);

      // Create local session
      const sessionId = await createLocalSession(localUser.id);

      const response = NextResponse.json({
        success: true,
        session: sessionId,
        user: {
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
        },
      });
      attachSession(response, sessionId);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Mobile ID token auth error:', message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (code && codeVerifier) {
    // --- Custom Tab OAuth PKCE flow ---
    try {
      const result = await workos.userManagement.authenticateWithCode({
        clientId: WORKOS_CLIENT_ID,
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
      attachSession(response, sessionId);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Mobile OAuth callback error:', message);
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
