import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import sql from '@/lib/db';
import crypto from 'crypto';

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

async function upsertUserFromOAuth(workosUser: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}) {
  const name = [workosUser.firstName, workosUser.lastName]
    .filter(Boolean)
    .join(' ') || workosUser.email.split('@')[0];

  const [existing] = await sql`
    SELECT id, email, name, invite_pending
    FROM users
    WHERE email = ${workosUser.email.toLowerCase()}
  `;

  if (existing) {
    await sql`
      UPDATE users
      SET
        name = COALESCE(${name}, name),
        google_id = ${workosUser.id},
        profile_image_url = ${workosUser.profilePictureUrl ?? null}
      WHERE id = ${existing.id}
    `;
    return existing;
  }

  const [newUser] = await sql`
    INSERT INTO users (email, name, password_hash, google_id, profile_image_url)
    VALUES (${workosUser.email.toLowerCase()}, ${name}, NULL, ${workosUser.id}, ${workosUser.profilePictureUrl ?? null})
    RETURNING id, email, name, invite_pending
  `;

  return newUser;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const rawState = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }
  if (!rawState) {
    return NextResponse.redirect(new URL('/login?error=missing_state', request.url));
  }

  let codeVerifier: string | undefined;
  try {
    const parsed = JSON.parse(rawState);
    codeVerifier = parsed.cv;
  } catch {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  }

  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/login?error=missing_verifier', request.url));
  }

  try {
    // Exchange code for tokens using PKCE verifier
    const result = await workos.userManagement.authenticateWithCode({
      code,
      codeVerifier,
    });
    console.error('Callback: authenticateWithCode result keys:', Object.keys(result));
    console.error('Callback: user:', JSON.stringify(result.user));

    if (!result.user) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Upsert user in our DB with OAuth profile info
    console.error('Callback: upserting user from OAuth');
    const user = await upsertUserFromOAuth({
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      profilePictureUrl: (result.user.profilePictureUrl as string | null) ?? null,
    });
    console.error('Callback: user upserted, id:', user?.id, 'email:', user?.email);

    if (!user?.id) {
      console.error('Callback FATAL: user.id is undefined!');
      return NextResponse.redirect(new URL('/login?error=user_create_failed', request.url));
    }

    // Create session — store the HASH of the session ID, never the raw value
    const sessionId = generateSessionId();
    const sessionIdHash = hashSessionId(sessionId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    console.error('Callback: creating session, hash:', sessionIdHash.substring(0, 16), 'expires:', expiresAt);

    await sql`
      INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
      VALUES (${user.id}, ${sessionIdHash}, ${expiresAt})
    `;
    console.error('Callback: session inserted in DB');

    // Build response with session cookie, then redirect to dashboard
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    redirectResponse.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    console.error('=== Callback success ===');
    console.error('Session ID (raw, truncated):', sessionId.substring(0, 16) + '...');
    console.error('Session hash (first 16):', sessionIdHash.substring(0, 16) + '...');
    console.error('User ID:', user.id);
    console.error('Cookie set, redirecting to /dashboard');

    return redirectResponse;
  } catch (error: any) {
    console.error('=== OAuth callback error ===');
    console.error('Full error:', JSON.stringify(error));
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error status:', error?.status);
    console.error('Error response:', error?.response);
    console.error('Error stack:', error?.stack?.split('\n').slice(0, 5).join('\n'));
    return NextResponse.redirect(new URL('/login?error=callback_failed&detail=' + encodeURIComponent(error?.message || String(error)), request.url));
  }
}

// Support both GET and POST for WorkOS webhooks / compatibility
export async function POST(request: NextRequest) {
  return GET(request);
}