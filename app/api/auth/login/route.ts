import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    // Find user
    const [user] = await sql`
      SELECT id, email, name, password_hash
      FROM users
      WHERE email = ${email}
    `;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    if (user.password_hash !== passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
      VALUES (${user.id}, ${sessionId}, ${expiresAt})
    `;

    // CORS for Expo app
    response.headers.set('Access-Control-Allow-Origin', 'https://web-redrixvixs-projects.vercel.app');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Cookie');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name }
    });

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}