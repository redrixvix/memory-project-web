import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

async function getUserFromSession(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  if (!sessionId) return null;

  const sessionIdHash = hashSessionId(sessionId);

  const [session] = await sql`
    SELECT user_id, expires_at
    FROM auth_sessions
    WHERE workos_session_id = ${sessionIdHash}
  `;

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  const [user] = await sql`SELECT id, email, name, created_at, profile_image_url FROM users WHERE id = ${session.user_id}`;

  return user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await params;

    // Find the pending invite by token
    const [member] = await sql`
      SELECT id, book_id, user_id, invite_email
      FROM book_members
      WHERE invite_token = ${token}
        AND joined_at IS NULL
    `;

    if (!member) {
      return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
    }

    // Accept the invite: set user_id and joined_at, clear invite_token
    await sql`
      UPDATE book_members
      SET user_id = ${user.id}, joined_at = CURRENT_TIMESTAMP, invite_token = NULL
      WHERE invite_token = ${token} AND joined_at IS NULL
    `;

    return NextResponse.json({ data: { success: true, book_id: member.book_id } });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}