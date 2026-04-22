import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;

    console.error('=== /api/auth/me called ===');
    console.error('Has session cookie:', !!sessionId);
    console.error('Cookie value (first 16):', sessionId ? sessionId.substring(0, 16) + '...' : 'none');

    if (!sessionId) {
      console.error('No session cookie - returning 401');
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sessionIdHash = hashSessionId(sessionId);
    console.error('Hash (first 16):', sessionIdHash.substring(0, 16) + '...');

    // Get user from session (lookup by hashed ID)
    const [session] = await sql`
      SELECT user_id, expires_at
      FROM auth_sessions
      WHERE workos_session_id = ${sessionIdHash}
    `;

    console.error('Session found:', !!session);

    if (!session) {
      console.error('Session not found in DB - returning 401');
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      await sql`DELETE FROM auth_sessions WHERE workos_session_id = ${sessionIdHash}`;
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get user
    const [user] = await sql`
      SELECT id, email, name, created_at, profile_image_url
      FROM users
      WHERE id = ${session.user_id}
    `;

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImageUrl: user.profile_image_url ?? null,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}