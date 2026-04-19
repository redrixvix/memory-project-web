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

    const [book] = await sql`
      SELECT id, owner_id FROM books WHERE id = ${parseInt(id)} AND owner_id = ${user.id}
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found or not authorized' }, { status: 404 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const [invitedUser] = await sql`
      SELECT id, email, name FROM users WHERE email = ${email}
    `;

    if (!invitedUser) {
      return NextResponse.json(
        { error: 'User not found. They must sign up first.' },
        { status: 404 }
      );
    }

    const [existing] = await sql`
      SELECT id FROM book_collaborators WHERE book_id = ${book.id} AND user_id = ${invitedUser.id}
    `;

    if (existing) {
      return NextResponse.json(
        { error: 'User is already a collaborator' },
        { status: 409 }
      );
    }

    const [collaborator] = await sql`
      INSERT INTO book_collaborators (book_id, user_id, role, accepted_at)
      VALUES (${book.id}, ${invitedUser.id}, 'contributor', CURRENT_TIMESTAMP)
      RETURNING id, book_id, user_id, role, invited_at
    `;

    return NextResponse.json({ collaborator }, { status: 201 });
  } catch (error) {
    console.error('Invite collaborator error:', error);
    return NextResponse.json(
      { error: 'Failed to invite collaborator' },
      { status: 500 }
    );
  }
}