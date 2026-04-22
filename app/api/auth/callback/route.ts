import { NextRequest, NextResponse } from 'next/server';
import { workos, APP_URL } from '@/lib/workos';
import sql from '@/lib/db';
import crypto from 'crypto';

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function upsertGoogleUser(workosUser: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}) {
  const name = [workosUser.firstName, workosUser.lastName]
    .filter(Boolean)
    .join(' ') || workosUser.email.split('@')[0];

  // Try to update existing user or insert new
  const [existing] = await sql`
    SELECT id, email, name, invite_pending
    FROM users
    WHERE email = ${workosUser.email.toLowerCase()}
  `;

  if (existing) {
    // Update with Google info
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

  // Create new user
  const [newUser] = await sql`
    INSERT INTO users (email, name, password_hash, google_id, profile_image_url)
    VALUES (${workosUser.email.toLowerCase()}, ${name}, NULL, ${workosUser.id}, ${workosUser.profilePictureUrl ?? null})
    RETURNING id, email, name, invite_pending
  `;

  return newUser;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    // Read and clear the PKCE verifier cookie
    const codeVerifier = request.cookies.get('pkce_verifier')?.value;
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Clear the verifier cookie immediately
    response.cookies.delete('pkce_verifier');

    if (!codeVerifier) {
      return NextResponse.redirect(new URL('/login?error=missing_verifier', request.url));
    }

    // Exchange code for tokens
    const result = await workos.userManagement.authenticateWithCode({
      code,
      codeVerifier,
    });

    if (!result.user) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Upsert user in our DB with Google profile info
    const user = await upsertGoogleUser({
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      profilePictureUrl: (result.user.profilePictureUrl as string | null) ?? null,
    });

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
      VALUES (${user.id}, ${sessionId}, ${expiresAt})
    `;

    // Set session cookie and redirect
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}

// Support both GET and POST for WorkOS webhooks / compatibility
export async function POST(request: NextRequest) {
  return GET(request);
}