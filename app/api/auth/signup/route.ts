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
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    // Create user in database
    const [user] = await sql`
      INSERT INTO users (email, name, password_hash)
      VALUES (${email}, ${name}, ${passwordHash})
      RETURNING id, email, name, created_at
    `;

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
      VALUES (${user.id}, ${sessionId}, ${expiresAt})
    `;

    // CORS for Expo app
    const response = NextResponse.json({ user }, { status: 201 });

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
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}