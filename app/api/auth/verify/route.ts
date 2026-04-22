import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import sql from '@/lib/db';
import crypto from 'crypto';

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function authenticateMagic(code: string, email: string) {
  const result = await workos.userManagement.authenticateWithMagicAuth({
    code,
    email,
  });
  return result;
}

async function upsertUser(workosUser: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const [existing] = await sql`
    SELECT id, email, name, invite_pending
    FROM users
    WHERE email = ${workosUser.email.toLowerCase()}
  `;

  if (existing) {
    // Mark invite pending as resolved if it was set
    if (existing.invite_pending) {
      await sql`
        UPDATE users
        SET invite_pending = false
        WHERE id = ${existing.id}
      `;
    }
    return existing;
  }

  // Create new user
  const name = [workosUser.firstName, workosUser.lastName]
    .filter(Boolean)
    .join(' ') || workosUser.email.split('@')[0];

  const [newUser] = await sql`
    INSERT INTO users (email, name, password_hash)
    VALUES (${workosUser.email.toLowerCase()}, ${name}, NULL)
    RETURNING id, email, name, invite_pending
  `;

  return newUser;
}

function createSessionCookie(sessionId: string): NextResponse['cookies'] extends { set: (...args: infer A) => infer R } ? R : never {
  // We'll set it manually on the response
  return {} as ReturnType<NextResponse['cookies']['set']>;
}

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json({ error: 'Code and email are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Authenticate with WorkOS
    const result = await authenticateMagic(code, normalizedEmail);

    if (!result.user) {
      return NextResponse.json({ error: 'Invalid or expired magic link' }, { status: 401 });
    }

    // Upsert user in our DB
    const user = await upsertUser({
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
    });

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
      VALUES (${user.id}, ${sessionId}, ${expiresAt})
    `;

    // Build response
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name }
    });

    response.headers.set('Access-Control-Allow-Origin', 'https://web-redrixvixs-projects.vercel.app');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Cookie');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Magic verify error:', error);
    const message = error instanceof Error ? error.message : String(error);
    // WorkOS returns specific error codes for expired/invalid codes
    if (message.includes('invalid') || message.includes('expired') || message.includes('code')) {
      return NextResponse.json({ error: 'Invalid or expired magic link. Please request a new one.' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to verify magic link', detail: message },
      { status: 500 }
    );
  }
}

// GET version for magic link redirects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    if (!code || !email) {
      return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Authenticate with WorkOS
    const result = await authenticateMagic(code, normalizedEmail);

    if (!result.user) {
      return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
    }

    // Upsert user in our DB
    const user = await upsertUser({
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
    });

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
      VALUES (${user.id}, ${sessionId}, ${expiresAt})
    `;

    // Redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Magic verify GET error:', error);
    return NextResponse.redirect(new URL('/login?error=verify_failed', request.url));
  }
}