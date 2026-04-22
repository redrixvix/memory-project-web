import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

// This mimics the callback's session creation exactly
export async function GET(request: NextRequest) {
  // Get first user
  const [user] = await sql`SELECT id, email FROM users LIMIT 1`;
  
  const sessionId = generateSessionId();
  const sessionIdHash = hashSessionId(sessionId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await sql`
    INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
    VALUES (${user.id}, ${sessionIdHash}, ${expiresAt})
  `;
  
  console.error('=== Test redirect: setting cookie and redirecting ===');
  console.error('Session hash first 16:', sessionIdHash.substring(0, 16));
  
  // Exactly like the callback does it
  const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
  redirectResponse.cookies.set('session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
  
  console.error('Cookie set on redirect response');
  return redirectResponse;
}
