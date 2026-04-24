import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import sql, { ensureDatabaseReady } from '@/lib/db';

type BookAccess = {
  id: number;
  owner_id: number;
  plan: string | null;
  storage_tier: string | null;
  is_owner: boolean;
};

type PlanValue = 'free' | 'pro';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

function parseBookId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function planToStorageTier(plan: PlanValue, currentStorageTier: string | null): string {
  if (plan === 'free') {
    return 'free';
  }

  return currentStorageTier && currentStorageTier !== 'free' ? currentStorageTier : '5gb';
}

async function getUserFromSession(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  if (!sessionId) {
    return null;
  }

  const sessionIdHash = hashSessionId(sessionId);

  const [session] = await sql`
    SELECT user_id, expires_at
    FROM auth_sessions
    WHERE workos_session_id = ${sessionIdHash}
  `;

  if (!session || new Date(session.expires_at) < new Date()) {
    return null;
  }

  const [user] = await sql`
    SELECT id, email, name, created_at
    FROM users
    WHERE id = ${session.user_id}
  `;

  return user ?? null;
}

async function getBookAccess(userId: number, bookId: number): Promise<BookAccess | null> {
  const [book] = await sql`
    SELECT
      b.id,
      b.owner_id,
      b.plan,
      b.storage_tier,
      (b.owner_id = ${userId}) AS is_owner
    FROM books b
    WHERE b.id = ${bookId}
      AND (
        b.owner_id = ${userId}
        OR EXISTS (
          SELECT 1
          FROM book_members bm
          WHERE bm.book_id = b.id
            AND bm.user_id = ${userId}
            AND bm.joined_at IS NOT NULL
        )
        OR EXISTS (
          SELECT 1
          FROM book_collaborators bc
          WHERE bc.book_id = b.id
            AND bc.user_id = ${userId}
        )
      )
  `;

  return (book as BookAccess | undefined) ?? null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();

    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bookId = parseBookId(id);
    if (!bookId) {
      return NextResponse.json({ error: 'Invalid book id' }, { status: 400 });
    }

    const book = await getBookAccess(user.id, bookId);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({
      plan: book.plan ?? 'free',
      can_manage_plan: book.is_owner,
    });
  } catch (error) {
    console.error('Get book plan error:', error);
    return NextResponse.json(
      { error: 'Failed to get plan', detail: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();

    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bookId = parseBookId(id);
    if (!bookId) {
      return NextResponse.json({ error: 'Invalid book id' }, { status: 400 });
    }

    const book = await getBookAccess(user.id, bookId);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (!book.is_owner) {
      return NextResponse.json({ error: 'Only the book owner can change the plan' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const plan = body && typeof body.plan === 'string' ? body.plan : null;
    if (plan !== 'free' && plan !== 'pro') {
      return NextResponse.json({ error: 'Plan must be free or pro' }, { status: 400 });
    }

    const [updated] = await sql`
      UPDATE books
      SET
        plan = ${plan},
        storage_tier = ${planToStorageTier(plan, book.storage_tier)},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${book.id}
      RETURNING id, plan, storage_tier
    `;

    return NextResponse.json({
      plan: updated.plan,
      storage_tier: updated.storage_tier,
    });
  } catch (error) {
    console.error('Set book plan error:', error);
    return NextResponse.json(
      { error: 'Failed to set plan', detail: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
