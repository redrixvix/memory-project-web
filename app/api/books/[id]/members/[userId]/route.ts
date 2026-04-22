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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, userId } = await params;
    const bookId = parseInt(id);
    const targetUserId = parseInt(userId);

    // Check user is owner or admin
    const [membership] = await sql`
      SELECT role FROM book_members
      WHERE book_id = ${bookId} AND user_id = ${user.id}
    `;

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot remove owner
    const [targetMembership] = await sql`
      SELECT role FROM book_members WHERE book_id = ${bookId} AND user_id = ${targetUserId}
    `;

    if (!targetMembership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (targetMembership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove the owner' }, { status: 400 });
    }

    await sql`
      DELETE FROM book_members WHERE book_id = ${bookId} AND user_id = ${targetUserId}
    `;

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, userId } = await params;
    const bookId = parseInt(id);
    const targetUserId = parseInt(userId);

    // Check user is owner or admin
    const [membership] = await sql`
      SELECT role FROM book_members
      WHERE book_id = ${bookId} AND user_id = ${user.id}
    `;

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    const validRoles = ['admin', 'contributor', 'answer_only'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check target membership
    const [targetMembership] = await sql`
      SELECT role FROM book_members WHERE book_id = ${bookId} AND user_id = ${targetUserId}
    `;

    if (!targetMembership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot change owner's role
    if (targetMembership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 });
    }

    // Cannot change own role if you're the owner
    if (user.id === targetUserId && membership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change own role' }, { status: 400 });
    }

    await sql`
      UPDATE book_members SET role = ${role}
      WHERE book_id = ${bookId} AND user_id = ${targetUserId}
    `;

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Update member role error:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}