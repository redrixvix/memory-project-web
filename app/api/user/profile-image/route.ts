import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import crypto from 'crypto';

function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

// POST /api/user/profile-image — Upload a profile image via UploadThing
export async function POST(request: NextRequest) {
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

    // Parse the multipart form data to extract the file
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

    // Convert to buffer for UploadThing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload via UploadThing server SDK
    const { UTApi } = await import('uploadthing/server');
    const utapi = new UTApi();

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `profile-images/${session.user_id}/${Date.now()}.${ext}`;

    // Convert to UTFile for UploadThing
    const { UTFile } = await import('uploadthing/server');
    const utFile = new UTFile([buffer], file.name, {
      type: file.type,
    });

    const result = await utapi.uploadFiles([utFile]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploaded = result[0] as any;
    const publicUrl = uploaded.right?.ufsUrl ?? uploaded.ufsUrl;

    // Optionally update the user's profile_image_url
    await sql`
      UPDATE users
      SET profile_image_url = ${publicUrl}
      WHERE id = ${session.user_id}
    `;

    return NextResponse.json({ url: publicUrl, key: uploaded.key });
  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
