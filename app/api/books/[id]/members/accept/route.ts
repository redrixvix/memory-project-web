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
    const { id } = await params;
    const bookId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the pending invite
    const [member] = await sql`
      SELECT bm.id, bm.user_id, bm.role, bm.invite_email, b.title as book_title
      FROM book_members bm
      JOIN books b ON bm.book_id = b.id
      WHERE bm.book_id = ${bookId}
        AND bm.invite_token = ${token}
        AND bm.joined_at IS NULL
    `;

    if (!member) {
      return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        book_id: bookId,
        book_title: member.book_title,
        role: member.role,
        invite_email: member.invite_email,
      }
    });
  } catch (error) {
    console.error('Validate invite error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the pending invite
    const [member] = await sql`
      SELECT id, user_id, invite_email FROM book_members
      WHERE book_id = ${bookId}
        AND invite_token = ${token}
        AND joined_at IS NULL
    `;

    if (!member) {
      return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
    }

    // If invite_email doesn't match the logged-in user's email, check if the user
    // was invited by email and is now signing up for the first time
    // Update the member entry with the actual user_id and set joined_at
    await sql`
      UPDATE book_members
      SET user_id = ${user.id}, joined_at = CURRENT_TIMESTAMP, invite_token = NULL
      WHERE book_id = ${bookId} AND invite_token = ${token} AND joined_at IS NULL
    `;

    return NextResponse.json({ data: { success: true, book_id: bookId } });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
