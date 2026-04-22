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

  const [user] = await sql`
    SELECT id, email, name, created_at
    FROM users
    WHERE id = ${session.user_id}
  `;

  return user;
}

async function checkBookAccess(userId: number, bookId: number) {
  const [book] = await sql`
    SELECT b.id, b.owner_id, b.title, b.description, b.storage_tier, b.storage_used_bytes, b.created_at,
           u.name as owner_name
    FROM books b
    JOIN users u ON b.owner_id = u.id
    WHERE b.id = ${bookId}
  `;

  if (!book) return null;
  if (book.owner_id === userId) return book;
  const [member] = await sql`
    SELECT role FROM book_members
    WHERE book_id = ${bookId} AND user_id = ${userId} AND joined_at IS NOT NULL
  `;
  if (member) return book;
  return null;
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
    const book = await checkBookAccess(user.id, parseInt(id));

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const memories = await sql`
      SELECT id, prompt_question, answer_text, photo_urls, audio_url, created_at
      FROM memories
      WHERE book_id = ${book.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ book, memories });
  } catch (error) {
    console.error('Get book error:', error);
    return NextResponse.json(
      { error: 'Failed to get book' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const book = await checkBookAccess(user.id, parseInt(id));

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only owner can update book' }, { status: 403 });
    }

    const { title, description } = await request.json();

    const [updatedBook] = await sql`
      UPDATE books
      SET title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${book.id}
      RETURNING id, title, description, storage_tier, storage_used_bytes, created_at
    `;

    return NextResponse.json({ book: updatedBook });
  } catch (error) {
    console.error('Update book error:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [book] = await sql`
      SELECT id FROM books WHERE id = ${parseInt(id)} AND owner_id = ${user.id}
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found or not authorized' }, { status: 404 });
    }

    await sql`DELETE FROM books WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete book error:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}