import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

async function getUserFromSession(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  if (!sessionId) return null;

  const [session] = await sql`
    SELECT user_id, expires_at
    FROM auth_sessions
    WHERE workos_session_id = ${sessionId}
  `;

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  const [user] = await sql`
    SELECT id, email, name, created_at
    FROM users
    WHERE id = ${session.user_id}
  `;

  return user;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, userId } = await params;
    const bookId = parseInt(id);
    const collaboratorId = parseInt(userId);

    const [book] = await sql`
      SELECT id, owner_id FROM books WHERE id = ${bookId} AND owner_id = ${user.id}
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found or not authorized' }, { status: 404 });
    }

    if (collaboratorId === book.owner_id) {
      return NextResponse.json({ error: 'Cannot remove book owner' }, { status: 400 });
    }

    await sql`
      DELETE FROM book_collaborators
      WHERE book_id = ${bookId} AND user_id = ${collaboratorId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    return NextResponse.json(
      { error: 'Failed to remove collaborator' },
      { status: 500 }
    );
  }
}