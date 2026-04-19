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
      SELECT b.id, b.owner_id, b.storage_tier
      FROM books b
      LEFT JOIN book_collaborators bc ON b.id = bc.book_id AND bc.user_id = ${user.id}
      WHERE b.id = ${parseInt(id)} AND (b.owner_id = ${user.id} OR bc.user_id = ${user.id})
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const { prompt_question, answer_text, photo_urls, audio_url } = await request.json();

    if (!answer_text) {
      return NextResponse.json(
        { error: 'Answer text is required' },
        { status: 400 }
      );
    }

    const [memory] = await sql`
      INSERT INTO memories (book_id, prompt_question, answer_text, photo_urls, audio_url)
      VALUES (${book.id}, ${prompt_question || null}, ${answer_text}, ${photo_urls || []}, ${audio_url || null})
      RETURNING id, book_id, prompt_question, answer_text, photo_urls, audio_url, created_at
    `;

    return NextResponse.json({ memory }, { status: 201 });
  } catch (error) {
    console.error('Create memory error:', error);
    return NextResponse.json(
      { error: 'Failed to create memory' },
      { status: 500 }
    );
  }
}