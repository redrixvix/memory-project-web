import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

import sql from '@/lib/db';

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
    SELECT id, email, name, created_at, profile_image_url
    FROM users
    WHERE id = ${session.user_id}
  `;

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const bookId = Number(body.bookId);
    const keys = Array.isArray(body.keys)
      ? body.keys.filter((key: unknown): key is string => typeof key === 'string' && key.trim().length > 0)
      : [];

    if (!Number.isFinite(bookId)) {
      return NextResponse.json({ error: 'A valid bookId is required.' }, { status: 400 });
    }

    if (keys.length === 0) {
      return NextResponse.json({ success: true, deletedCount: 0 });
    }

    const [book] = await sql`
      SELECT id
      FROM books
      WHERE id = ${bookId}
        AND (
          owner_id = ${user.id}
          OR id IN (
            SELECT book_id
            FROM book_collaborators
            WHERE user_id = ${user.id}
          )
        )
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const utapi = new UTApi();
    const result = await utapi.deleteFiles(keys);

    return NextResponse.json(result);
  } catch (error) {
    console.error('UploadThing delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete uploaded files.' },
      { status: 500 }
    );
  }
}
