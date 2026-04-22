import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  
  if (!sessionId) {
    return NextResponse.json({ hasSession: false, reason: 'no cookie' });
  }
  
  const hash = hashSessionId(sessionId);
  
  const [session] = await sql`
    SELECT s.user_id, s.expires_at, u.email, u.name
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.workos_session_id = ${hash}
  `;
  
  if (!session) {
    return NextResponse.json({ 
      hasSession: false, 
      reason: 'session not in DB',
      hashFirst16: hash.substring(0, 16)
    });
  }
  
  const expired = new Date(session.expires_at) < new Date();
  
  return NextResponse.json({
    hasSession: true,
    expired,
    user: { id: session.user_id, email: session.email, name: session.name }
  });
}
