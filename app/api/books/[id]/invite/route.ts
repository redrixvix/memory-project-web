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

    // Check user is owner or admin of this book
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

    // Check if user already has a pending invite or is already a member
    const [existingMember] = await sql`
      SELECT id, joined_at FROM book_members
      WHERE book_id = ${bookId} AND invite_email = ${email}
    `;

    if (existingMember && existingMember.joined_at) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
    }

    // Generate invite token
    const inviteToken = randomBytes(16).toString('hex');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://web-redrixvixs-projects.vercel.app';
    const inviteUrl = `${baseUrl}/invite/${inviteToken}`;

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser) {
      // Check if already a member (not pending)
      const [alreadyMember] = await sql`
        SELECT id FROM book_members
        WHERE book_id = ${bookId} AND user_id = ${existingUser.id} AND joined_at IS NOT NULL
      `;

      if (alreadyMember) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
      }

      // Upsert into book_members with pending state
      if (existingMember) {
        await sql`
          UPDATE book_members
          SET invite_token = ${inviteToken}, role = ${role}, joined_at = NULL
          WHERE book_id = ${bookId} AND invite_email = ${email}
        `;
      } else {
        await sql`
          INSERT INTO book_members (book_id, user_id, role, invite_token, invite_email, joined_at)
          VALUES (${bookId}, ${existingUser.id}, ${role}, ${inviteToken}, ${email}, NULL)
        `;
      }
    } else {
      // Check if there's already a pending invite for this email (placeholder entry)
      const [existingPending] = await sql`
        SELECT id FROM book_members
        WHERE book_id = ${bookId} AND invite_email = ${email} AND joined_at IS NULL AND (user_id IS NULL OR user_id NOT IN (SELECT id FROM users WHERE email = ${email}))
      `;

      if (existingPending) {
        // Update existing pending invite
        await sql`
          UPDATE book_members
          SET invite_token = ${inviteToken}, role = ${role}
          WHERE book_id = ${bookId} AND invite_email = ${email} AND joined_at IS NULL
        `;
      } else {
        // User doesn't exist yet — create a placeholder entry in book_members
        // The signup flow will handle creating the actual user account
        await sql`
          INSERT INTO book_members (book_id, role, invite_token, invite_email, joined_at)
          VALUES (${bookId}, ${role}, ${inviteToken}, ${email}, NULL)
        `;
      }
    }

    return NextResponse.json({ invite_url: inviteUrl });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}
