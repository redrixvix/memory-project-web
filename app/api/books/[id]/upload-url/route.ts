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
      SELECT id, storage_tier, storage_used_bytes
      FROM books
      WHERE id = ${parseInt(id)} AND owner_id = ${user.id}
    `;

    if (!book) {
      return NextResponse.json({ error: 'Book not found or not authorized' }, { status: 404 });
    }

    if (book.storage_tier === 'free') {
      return NextResponse.json(
        { error: 'Storage upgrade required to upload photos/audio' },
        { status: 403 }
      );
    }

    const { filename, content_type } = await request.json();

    if (!filename || !content_type) {
      return NextResponse.json(
        { error: 'Filename and content_type are required' },
        { status: 400 }
      );
    }

    // Return a placeholder URL - in production, implement actual S3 presigned URLs
    const key = `books/${book.id}/${Date.now()}-${filename}`;

    return NextResponse.json({
      upload_url: `https://placeholder-bucket.s3.amazonaws.com/${key}?presigned`,
      key
    });
  } catch (error) {
    console.error('Get upload URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}