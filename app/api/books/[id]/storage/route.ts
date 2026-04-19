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

function getStorageLimit(tier: string): number {
  switch (tier) {
    case '5gb':
      return 5 * 1024 * 1024 * 1024;
    case '15gb':
      return 15 * 1024 * 1024 * 1024;
    default:
      return 0;
  }
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

    const [book] = await sql`
      SELECT id, storage_tier, storage_used_bytes
      FROM books
      WHERE id = ${parseInt(id)} AND (owner_id = ${user.id} OR id IN (
        SELECT book_id FROM book_collaborators WHERE user_id = ${user.id} AND accepted_at IS NOT NULL
      ))
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const limit = getStorageLimit(book.storage_tier);
    const used = parseInt(book.storage_used_bytes) || 0;

    return NextResponse.json({
      used_bytes: used,
      limit_bytes: limit,
      tier: book.storage_tier,
    });
  } catch (error) {
    console.error('Get storage error:', error);
    return NextResponse.json(
      { error: 'Failed to get storage info' },
      { status: 500 }
    );
  }
}