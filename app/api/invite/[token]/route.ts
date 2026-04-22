import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the pending invite by token
    const [member] = await sql`
      SELECT bm.book_id, bm.role, bm.invite_email, b.title as book_title
      FROM book_members bm
      JOIN books b ON bm.book_id = b.id
      WHERE bm.invite_token = ${token}
        AND bm.joined_at IS NULL
    `;

    if (!member) {
      return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        book_id: member.book_id,
        book_title: member.book_title,
        role: member.role,
        invite_email: member.invite_email,
      }
    });
  } catch (error) {
    console.error('Validate invite error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}
