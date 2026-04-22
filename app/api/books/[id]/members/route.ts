import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
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
    const bookId = parseInt(id);

    // Check user is a member of this book
    const [membership] = await sql`
      SELECT role FROM book_members
      WHERE book_id = ${bookId} AND user_id = ${user.id}
    `;

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const members = await sql`
      SELECT bm.user_id, u.name, u.email, bm.role, bm.joined_at
      FROM book_members bm
      JOIN users u ON bm.user_id = u.id
      WHERE bm.book_id = ${bookId}
      ORDER BY bm.role = 'owner' DESC, bm.joined_at ASC
    `;

    return NextResponse.json({ data: members });
  } catch (error) {
    console.error('List members error:', error);
    return NextResponse.json(
      { error: 'Failed to list members' },
      { status: 500 }
    );
  }
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
    const bookId = parseInt(id);

    // Check user is owner or admin
    const [membership] = await sql`
      SELECT role FROM book_members
      WHERE book_id = ${bookId} AND user_id = ${user.id}
    `;

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, role = 'contributor' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const validRoles = ['admin', 'contributor', 'answer_only'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user exists
    const [existingUser] = await sql`
      SELECT id, email, name FROM users WHERE email = ${email}
    `;

    let memberId: number;
    let inviteToken: string;
    let isNewUser = false;

    if (existingUser) {
      // Check if already a member
      const [existingMembership] = await sql`
        SELECT id FROM book_members WHERE book_id = ${bookId} AND user_id = ${existingUser.id}
      `;

      if (existingMembership) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
      }

      const [member] = await sql`
        INSERT INTO book_members (book_id, user_id, role)
        VALUES (${bookId}, ${existingUser.id}, ${role})
        RETURNING id
      `;
      memberId = member.id;
      inviteToken = '';
    } else {
      // Create placeholder user
      inviteToken = randomBytes(16).toString('hex');

      const [newUser] = await sql`
        INSERT INTO users (email, name, invite_pending, invite_token)
        VALUES (${email}, ${email.split('@')[0]}, true, ${inviteToken})
        RETURNING id
      `;

      const [member] = await sql`
        INSERT INTO book_members (book_id, user_id, role, invite_token, invite_email)
        VALUES (${bookId}, ${newUser.id}, ${role}, ${inviteToken}, ${email})
        RETURNING id
      `;
      memberId = member.id;
      isNewUser = true;
    }

    return NextResponse.json(
      { data: { member_id: memberId, invite_token: inviteToken, is_new_user: isNewUser } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}