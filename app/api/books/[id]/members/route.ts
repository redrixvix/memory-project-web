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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bookId = parseInt(id);

    // Check user is a member — check both book_members and book_collaborators
    const [membership] = await sql`
      SELECT role FROM book_members
      WHERE book_id = ${bookId} AND user_id = ${user.id}
    `;
    const [collabMembership] = await sql`
      SELECT role FROM book_collaborators
      WHERE book_id = ${bookId} AND user_id = ${user.id}
    `;
    const [ownerCheck] = await sql`SELECT owner_id FROM books WHERE id = ${bookId}`;
    const isOwner = ownerCheck?.owner_id === user.id;

    if (!membership && !collabMembership && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get members from book_members
    const members = await sql`
      SELECT bm.user_id, bm.role, bm.invite_email, bm.joined_at,
             u.name, u.email
      FROM book_members bm
      JOIN users u ON bm.user_id = u.id
      WHERE bm.book_id = ${bookId}
      ORDER BY bm.role = 'owner' DESC, bm.joined_at ASC
    `;

    // If book_members is empty, fall back to book_collaborators
    let collabMembers: Record<string, unknown>[] = [];
    if (members.length === 0) {
      collabMembers = await sql`
        SELECT bc.user_id, bc.role, bc.invited_at as joined_at,
               u.name, u.email
        FROM book_collaborators bc
        JOIN users u ON bc.user_id = u.id
        WHERE bc.book_id = ${bookId}
        ORDER BY bc.role = 'owner' DESC
      `;
    }

    const allMembers = members.length > 0 ? members : collabMembers;
    return NextResponse.json({ data: allMembers });
  } catch (error) {
    console.error('List members error:', error);
    return NextResponse.json(
      { error: 'Failed to list members' },
      { status: 500 }
    );
  }
}