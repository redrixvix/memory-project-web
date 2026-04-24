import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

// Ensure plan column exists (idempotent — safe to call on every cold start)
let migrated = false;
async function ensurePlanColumn() {
  if (migrated) return;
  try {
    await sql`ALTER TABLE books ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'`;
    migrated = true;
  } catch {
    // Column may already exist
    migrated = true;
  }
}

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

async function checkBookOwnership(userId: number, bookId: number) {
  const [book] = await sql`
    SELECT b.id, b.owner_id, b.plan
    FROM books b
    WHERE b.id = ${bookId}
  `;

  if (!book) return null;
  if (book.owner_id === userId) return book;
  const [member] = await sql`
    SELECT role FROM book_members
    WHERE book_id = ${bookId} AND user_id = ${userId} AND joined_at IS NOT NULL
  `;
  if (member) return book;
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensurePlanColumn();
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const book = await checkBookOwnership(user.id, parseInt(id));

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ plan: book.plan || 'free' });
  } catch (error) {
    console.error('Get book plan error:', error);
    return NextResponse.json({ error: 'Failed to get plan' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensurePlanColumn();
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const book = await checkBookOwnership(user.id, parseInt(id));

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const { plan } = await request.json();

    if (!plan || !['free', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Plan must be free or pro' }, { status: 400 });
    }

    const [updated] = await sql`
      UPDATE books
      SET plan = ${plan}
      WHERE id = ${book.id}
      RETURNING id, plan
    `;

    return NextResponse.json({ plan: updated.plan });
  } catch (error) {
    console.error('Set book plan error:', error);
    return NextResponse.json({ error: 'Failed to set plan' }, { status: 500 });
  }
}
