import { NextRequest, NextResponse } from 'next/server';
import sql, { ensureDatabaseReady } from '@/lib/db';
import crypto from 'crypto';
import { normalizeBookPlan, parseBookPlanInput, planToStorageTier } from '@/lib/book-plan';

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

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseReady();
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get books owned by user and books where user is a member (via book_members)
    const books = await sql`
      SELECT DISTINCT b.id, b.title, b.description, b.storage_tier, b.plan, b.storage_used_bytes, b.created_at, b.updated_at, b.owner_id,
             u.name as owner_name, u.google_id as owner_google_id,
             COALESCE(bm.role, 'owner') as role,
             (SELECT COUNT(*) FROM memories m WHERE m.book_id = b.id) as memory_count
      FROM books b
      JOIN users u ON b.owner_id = u.id
      LEFT JOIN book_members bm ON b.id = bm.book_id AND bm.user_id = ${user.id}
      WHERE b.owner_id = ${user.id} OR bm.user_id = ${user.id}
      ORDER BY b.created_at DESC
    `;

    // Collect book IDs for contributor query
    const bookIds = books.map((b: Record<string, unknown>) => Number(b.id));

    const booksWithCount = books.map((b: Record<string, unknown>) => ({
      ...b,
      plan: normalizeBookPlan(b.plan, b.storage_tier),
      _count: { memories: Number(b.memory_count) },
      updated_at: b.updated_at ?? b.created_at,
    }));

    // Get contributors for all books in ONE query (avoids N+1 connection problem)
    const contributors: Record<string, {id: number, name: string, profile_image_url: string, google_id: string}[]> = {};
    try {
      if (bookIds.length > 0) {
        const rows = await sql`
          SELECT m.book_id, u.id, u.name, u.profile_image_url, u.google_id
          FROM memories m
          JOIN users u ON m.user_id = u.id
          WHERE m.book_id IN (${bookIds}) AND m.user_id IS NOT NULL
          ORDER BY m.book_id, u.id
        `;
        for (const row of rows as unknown as {book_id: string, id: number, name: string, profile_image_url: string, google_id: string}[]) {
          if (!contributors[row.book_id]) contributors[row.book_id] = [];
          if (contributors[row.book_id].length < 3) {
            contributors[row.book_id].push({ id: row.id, name: row.name, profile_image_url: row.profile_image_url, google_id: row.google_id });
          }
        }
      }
    } catch (e) {
      // Contributors query failed — continue without them (non-fatal)
      console.error('Contributors query failed:', e);
    }

    // Attach contributors (or owner fallback) to each book
    const result = booksWithCount.map((b: Record<string, unknown>) => {
      const bookId = String(b.id);
      const list = contributors[bookId] || [];
      if (list.length === 0) {
        // Fallback: show owner as contributor
        list.push({ id: Number(b.owner_id), name: String(b.owner_name), profile_image_url: '', google_id: String(b.owner_google_id || '') });
      }
      return { ...b, contributors: list };
    });

    return NextResponse.json({ books: result });
  } catch (error) {
    console.error('List books error:', error);
    return NextResponse.json(
      { error: 'Failed to list books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseReady();
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const selectedPlan =
      parseBookPlanInput(body?.plan) ??
      parseBookPlanInput(body?.subscriptionType) ??
      'free';

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const [book] = await sql`
      INSERT INTO books (owner_id, title, description, storage_tier, plan)
      VALUES (${user.id}, ${title}, ${description || null}, ${planToStorageTier(selectedPlan)}, ${selectedPlan})
      RETURNING id, title, description, storage_tier, plan, storage_used_bytes, created_at
    `;

    // Add owner as a member (book_members table, not book_collaborators)
    await sql`
      INSERT INTO book_members (book_id, user_id, role, joined_at)
      VALUES (${book.id}, ${user.id}, 'owner', CURRENT_TIMESTAMP)
    `;

    return NextResponse.json({
      book: {
        ...book,
        plan: normalizeBookPlan(book.plan, book.storage_tier),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create book error:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
