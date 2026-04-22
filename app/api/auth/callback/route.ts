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
  const codeVerifier = request.cookies.get('pkce_verifier')?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/login?error=missing_verifier', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  try {
    // Exchange code for tokens using PKCE verifier
    // authenticateWithCode with codeVerifier = PKCE flow (public client)
    const result = await workos.userManagement.authenticateWithCode({
      code,
      codeVerifier,
    });

    if (!result.user) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Upsert user in our DB with OAuth profile info
    const user = await upsertUserFromOAuth({
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      profilePictureUrl: (result.user.profilePictureUrl as string | null) ?? null,
    });

    // Create session — store the HASH of the session ID, never the raw value
    const sessionId = generateSessionId();
    const sessionIdHash = hashSessionId(sessionId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
      VALUES (${user.id}, ${sessionIdHash}, ${expiresAt})
    `;

    // Build response with session cookie, then redirect
    // Use NextResponse first to set cookies, then call redirect()
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    redirectResponse.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    // Clear the PKCE verifier by setting an expired cookie (delete() doesn't work on immutable Response headers)
    redirectResponse.cookies.set('pkce_verifier', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return redirectResponse;
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}

// Support both GET and POST for WorkOS webhooks / compatibility
export async function POST(request: NextRequest) {
  return GET(request);
}