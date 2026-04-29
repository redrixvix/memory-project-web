import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

// POST /api/user/profile-image — Upload a profile image via UploadThing
export async function POST(request: NextRequest) {
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

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be smaller than 4MB' }, { status: 400 });
    }

    const { UTApi } = await import('uploadthing/server');
    const { UTFile } = await import('uploadthing/server');

    const buffer = Buffer.from(await file.arrayBuffer());
    const utFile = new UTFile([buffer], file.name, { type: file.type });

    const utapi = new UTApi();
    const result = await utapi.uploadFiles([utFile]);

    const uploaded = result[0] as any;
    const publicUrl = uploaded.data?.ufsUrl ?? uploaded.ufsUrl ?? uploaded.url;

    await sql`
      UPDATE users
      SET profile_image_url = ${publicUrl}
      WHERE id = ${session.user_id}
    `;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Profile image upload error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}