import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionIdHash = hashSessionId(sessionId);
    const [session] = await sql`
      SELECT user_id, expires_at
      FROM auth_sessions
      WHERE workos_session_id = ${sessionIdHash}
    `;

    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, profile_image_url } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (typeof name === 'string' && name.trim()) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name.trim());
    }

    if (typeof profile_image_url === 'string') {
      paramCount++;
      updates.push(`profile_image_url = $${paramCount}`);
      values.push(profile_image_url);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    paramCount++;
    values.push(session.user_id);

    const [updated] = await sql`
      UPDATE users
      SET ${sql(updates.join(', '))}
      WHERE id = $${paramCount}
      RETURNING id, name, email, profile_image_url
    `;

    return NextResponse.json({ 
      id: updated.id, 
      name: updated.name, 
      email: updated.email,
      profile_image_url: updated.profile_image_url 
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
