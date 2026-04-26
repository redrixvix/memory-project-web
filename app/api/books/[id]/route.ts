import { NextRequest, NextResponse } from 'next/server';
import sql, { ensureDatabaseReady } from '@/lib/db';
import crypto from 'crypto';
import { normalizeBookPlan } from '@/lib/book-plan';

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
    SELECT b.id, b.owner_id, b.title, b.description, b.storage_tier, b.plan, b.storage_used_bytes, b.created_at,
           u.name as owner_name
    FROM books b
    JOIN users u ON b.owner_id = u.id
    WHERE b.id = ${bookId}
  `;

  if (!book) return null;
  if (book.owner_id === userId) return book;
  // Check book_members (new system)
  const [member] = await sql`
    SELECT role FROM book_members
    WHERE book_id = ${bookId} AND user_id = ${userId} AND joined_at IS NOT NULL
  `;
  if (member) return book;
  // Fallback to book_collaborators (old system)
  const [collab] = await sql`
    SELECT role FROM book_collaborators
    WHERE book_id = ${bookId} AND user_id = ${userId}
  `;
  if (collab) return book;
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const book = await checkBookAccess(user.id, parseInt(id));

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Get membership info — check book_members first, then book_collaborators as fallback
    let membership = null;
    const [bm] = await sql`
      SELECT user_id, role FROM book_members
      WHERE book_id = ${book.id} AND user_id = ${user.id} AND joined_at IS NOT NULL
    `;
    if (bm) {
      membership = { user_id: bm.user_id, role: bm.role };
    } else {
      // Fallback to book_collaborators for books created before the new system
      const [bc] = await sql`
        SELECT user_id, role FROM book_collaborators
        WHERE book_id = ${book.id} AND user_id = ${user.id}
      `;
      if (bc) {
        membership = { user_id: bc.user_id, role: bc.role };
      } else if (book.owner_id === user.id) {
        // Owner always has access
        membership = { user_id: user.id, role: 'owner' };
      }
    }

    const memories = await sql`
      SELECT m.id, m.book_id, m.prompt_question, m.answer_text, m.photo_urls, m.audio_url, m.created_at,
             u.name as contributor_name, u.profile_image_url as contributor_avatar, u.google_id as contributor_google_id
      FROM memories m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.book_id = ${book.id}
      ORDER BY m.created_at DESC
    `;

    return NextResponse.json({
      book: {
        ...book,
        plan: normalizeBookPlan(book.plan, book.storage_tier),
      },
      memories,
      membership,
    });
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
    await ensureDatabaseReady();
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
      RETURNING id, title, description, storage_tier, plan, storage_used_bytes, created_at
    `;

    return NextResponse.json({
      book: {
        ...updatedBook,
        plan: normalizeBookPlan(updatedBook.plan, updatedBook.storage_tier),
      },
    });
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
    await ensureDatabaseReady();
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
