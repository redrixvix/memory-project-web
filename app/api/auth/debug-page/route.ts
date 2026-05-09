import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  
  let body = `Cookie present: ${!!sessionId}\n`;
  if (sessionId) {
    body += `Cookie (first 16): ${sessionId.substring(0, 16)}...\n`;
    const hash = hashSessionId(sessionId);
    body += `Hash (first 16): ${hash.substring(0, 16)}...\n`;
    
    const [session] = await sql`
      SELECT s.user_id, s.expires_at, u.email, u.name
      FROM auth_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.workos_session_id = ${hash}
    `;
    
    if (session) {
      body += `Session found in DB: YES\n`;
      body += `User: ${session.name} (${session.email})\n`;
      body += `Expired: ${new Date(session.expires_at) < new Date() ? 'YES' : 'NO'}\n`;
    } else {
      body += `Session found in DB: NO\n`;
    }
  } else {
    body += `No session cookie found\n`;
  }
  
  return new Response(body, { 
    headers: { 'Content-Type': 'text/plain' },
    status: 200 
  });
}
