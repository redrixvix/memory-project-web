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
    if (existing.invite_pending) {
      await sql`
        UPDATE users
        SET invite_pending = false
        WHERE id = ${existing.id}
      `;
    }
    return existing;
  }

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

async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const sessionIdHash = hashSessionId(sessionId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
    VALUES (${userId}, ${sessionIdHash}, ${expiresAt})
  `;

  return sessionId;
}

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json({ error: 'Code and email are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await authenticateMagic(code, normalizedEmail);

    if (!result.user) {
      return NextResponse.json({ error: 'Invalid or expired magic link' }, { status: 401 });
    }

    const user = await upsertUser({
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
    });

    const sessionId = await createSession(Number(user.id));

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
    if (message.includes('invalid') || message.includes('expired') || message.includes('code')) {
      return NextResponse.json({ error: 'Invalid or expired magic link. Please request a new one.' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to verify magic link', detail: message },
      { status: 500 }
    );
  }
}

// GET handler: magic link click redirects here from the email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    if (!code || !email) {
      return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await authenticateMagic(code, normalizedEmail);

    if (!result.user) {
      return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
    }

    const user = await upsertUser({
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
    });

    const sessionId = await createSession(Number(user.id));

    // Build response with session cookie, then redirect
    // Must do this BEFORE calling redirect() — NextResponse.redirect() returns
    // an immutable redirect Response, so we cannot set cookies after
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    redirectResponse.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return redirectResponse;
  } catch (error: any) {
    console.error('Magic verify GET error:', error);
    return NextResponse.redirect(new URL('/login?error=verify_failed', request.url));
  }
}
