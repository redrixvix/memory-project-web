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
      SELECT id, title FROM books WHERE id = ${parseInt(id)} AND owner_id = ${user.id}
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found or not authorized' }, { status: 404 });
    }

    const memories = await sql`
      SELECT prompt_question, answer_text, photo_urls
      FROM memories WHERE book_id = ${book.id} ORDER BY created_at ASC
    `;

    const orderId = `MP-${Date.now()}`;

    return NextResponse.json({
      order_id: orderId,
      status: 'processing',
      message: 'Print order submitted. You will receive an email with tracking information.',
    });
  } catch (error) {
    console.error('Order print error:', error);
    return NextResponse.json(
      { error: 'Failed to submit print order' },
      { status: 500 }
    );
  }
}