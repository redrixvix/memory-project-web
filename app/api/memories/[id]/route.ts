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

    const [memory] = await sql`
      SELECT m.id, m.book_id, m.prompt_question, m.answer_text, m.photo_urls, m.audio_url, m.user_id, m.created_at,
             u.name as contributor_name, u.profile_image_url as contributor_avatar,
             b.owner_id
      FROM memories m
      JOIN users u ON m.user_id = u.id
      JOIN books b ON m.book_id = b.id
      LEFT JOIN book_collaborators bc ON b.id = bc.book_id AND bc.user_id = ${user.id}
      WHERE m.id = ${parseInt(id)} AND (b.owner_id = ${user.id} OR bc.user_id = ${user.id})
    `;

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    return NextResponse.json({ memory });
  } catch (error) {
    console.error('Get memory error:', error);
    return NextResponse.json(
      { error: 'Failed to get memory' },
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

    const [memory] = await sql`
      SELECT m.id, m.book_id, m.answer_text, m.photo_urls, m.audio_url,
             b.owner_id
      FROM memories m
      JOIN books b ON m.book_id = b.id
      LEFT JOIN book_collaborators bc ON b.id = bc.book_id AND bc.user_id = ${user.id}
      WHERE m.id = ${parseInt(id)} AND (b.owner_id = ${user.id} OR bc.user_id = ${user.id})
    `;

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const { prompt_question, answer_text, photo_urls, audio_url } = await request.json();

    const [updatedMemory] = await sql`
      UPDATE memories
      SET prompt_question = COALESCE(${prompt_question}, prompt_question),
          answer_text = COALESCE(${answer_text}, answer_text),
          photo_urls = COALESCE(${photo_urls}, photo_urls),
          audio_url = COALESCE(${audio_url}, audio_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${memory.id}
      RETURNING id, book_id, prompt_question, answer_text, photo_urls, audio_url, user_id, created_at
    `;

    return NextResponse.json({ memory: updatedMemory });
  } catch (error) {
    console.error('Update memory error:', error);
    return NextResponse.json(
      { error: 'Failed to update memory' },
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

    const [memory] = await sql`
      SELECT m.id, b.owner_id
      FROM memories m
      JOIN books b ON m.book_id = b.id
      WHERE m.id = ${parseInt(id)}
    `;

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    if (memory.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only book owner can delete memories' }, { status: 403 });
    }

    await sql`DELETE FROM memories WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete memory error:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    );
  }
}