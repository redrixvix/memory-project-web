import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get user from session
    const [session] = await sql`
      SELECT user_id, expires_at
      FROM auth_sessions
      WHERE workos_session_id = ${sessionId}
    `;

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      await sql`DELETE FROM auth_sessions WHERE workos_session_id = ${sessionId}`;
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get user
    const [user] = await sql`
      SELECT id, email, name, created_at
      FROM users
      WHERE id = ${session.user_id}
    `;

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}