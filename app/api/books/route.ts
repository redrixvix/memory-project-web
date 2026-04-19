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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get books owned by user and books where user is collaborator
    const books = await sql`
      SELECT DISTINCT b.id, b.title, b.description, b.storage_tier, b.storage_used_bytes, b.created_at,
             u.name as owner_name,
             COALESCE(bc.role, 'owner') as role
      FROM books b
      JOIN users u ON b.owner_id = u.id
      LEFT JOIN book_collaborators bc ON b.id = bc.book_id AND bc.user_id = ${user.id}
      WHERE b.owner_id = ${user.id} OR bc.user_id = ${user.id}
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json({ books });
  } catch (error) {
    console.error('List books error:', error);
    return NextResponse.json(
      { error: 'Failed to list books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const [book] = await sql`
      INSERT INTO books (owner_id, title, description, storage_tier)
      VALUES (${user.id}, ${title}, ${description || null}, 'free')
      RETURNING id, title, description, storage_tier, storage_used_bytes, created_at
    `;

    // Add owner as collaborator
    await sql`
      INSERT INTO book_collaborators (book_id, user_id, role, accepted_at)
      VALUES (${book.id}, ${user.id}, 'owner', CURRENT_TIMESTAMP)
    `;

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Create book error:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}