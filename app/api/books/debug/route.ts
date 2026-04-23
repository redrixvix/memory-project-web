import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'No session cookie' }, { status: 401 });

    const sessionIdHash = hashSessionId(sessionId);
    const [session] = await sql`SELECT user_id, expires_at FROM auth_sessions WHERE workos_session_id = ${sessionIdHash}`;
    if (!session) return NextResponse.json({ error: 'Session not found in DB', hash: sessionIdHash.substring(0, 8) }, { status: 401 });
    if (new Date(session.expires_at) < new Date()) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const [user] = await sql`SELECT id, email, name FROM users WHERE id = ${session.user_id}`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    // Simple books query
    const books = await sql`SELECT id, title FROM books WHERE owner_id = ${user.id} ORDER BY created_at DESC LIMIT 5`;
    
    return NextResponse.json({ user: { id: user.id, email: user.email }, booksCount: books.length, books: books });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
