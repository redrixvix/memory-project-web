import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

async function getUserFromSession(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  if (!sessionId) return null;
  const [session] = await sql`
    SELECT user_id, expires_at FROM auth_sessions WHERE workos_session_id = ${sessionId}
  `;
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  const [user] = await sql`SELECT id, email, name FROM users WHERE id = ${session.user_id}`;
  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) const origin = request.headers.get('origin') || 'https://web-redrixvixs-projects.vercel.app';
    const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;
    const { id } = await params;
    const memories = await sql`
      SELECT m.id, m.book_id, m.prompt_question, m.answer_text, m.photo_urls, m.audio_url, m.created_at
      FROM memories m JOIN books b ON m.book_id = b.id
      LEFT JOIN book_collaborators bc ON b.id = bc.book_id AND bc.user_id = ${user.id}
      WHERE m.book_id = ${id} AND (b.owner_id = ${user.id} OR bc.user_id = ${user.id})
      ORDER BY m.created_at ASC
    `;
    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Get memories error:', error);
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) const origin = request.headers.get('origin') || 'https://web-redrixvixs-projects.vercel.app';
    const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;
    const { id: bookId } = await params;
    const { prompt_question, answer_text, photo_urls, audio_url } = await request.json();

    if (!answer_text && !photo_urls && !audio_url) {
      return NextResponse.json({ error: 'answer_text, photo_urls, or audio_url required' }, { status: 400 });
    }

    const [book] = await sql`
      SELECT id FROM books WHERE id = ${bookId}
      AND (owner_id = ${user.id} OR id IN (SELECT book_id FROM book_collaborators WHERE user_id = ${user.id}))
    `;
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    const [memory] = await sql`
      INSERT INTO memories (book_id, prompt_question, answer_text, photo_urls, audio_url)
      VALUES (${bookId}, ${prompt_question || null}, ${answer_text}, ${photo_urls || null}, ${audio_url || null})
      RETURNING id, book_id, prompt_question, answer_text, photo_urls, audio_url, created_at
    `;
    return NextResponse.json({ memory }, { status: 201 });
  } catch (error) {
    console.error('Create memory error:', error);
    return NextResponse.json(
      { error: 'Failed to create memory', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
