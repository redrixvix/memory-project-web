import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;

    if (sessionId) {
      const sessionIdHash = hashSessionId(sessionId);
      // Delete session from database using hashed ID
      await sql`
        DELETE FROM auth_sessions
        WHERE workos_session_id = ${sessionIdHash}
      `;
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}