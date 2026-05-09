import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  if (sessionId) {
    return NextResponse.json({ 
      hasSession: true, 
      sessionFirst16: sessionId.substring(0, 16),
      hashFirst16: hashSessionId(sessionId).substring(0, 16)
    });
  }
  return NextResponse.json({ hasSession: false });
}

export async function POST() {
  // Create a test session for a known user
  const [{ id: userId }] = await sql`SELECT id FROM users LIMIT 1`;
  
  const sessionId = generateSessionId();
  const sessionIdHash = hashSessionId(sessionId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await sql`
    INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
    VALUES (${userId}, ${sessionIdHash}, ${expiresAt})
  `;
  
  const response = NextResponse.json({ 
    created: true, 
    sessionHashFirst16: sessionIdHash.substring(0, 16),
    userId 
  });
  
  response.cookies.set('session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
  
  return response;
}
