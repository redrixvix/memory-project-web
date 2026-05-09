import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import { UTFile } from 'uploadthing/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const utFile = new UTFile([buffer], file.name, { type: file.type });

    const utapi = new UTApi();
    console.log('UPLOADTHING_TOKEN:', process.env.UPLOADTHING_TOKEN ? 'SET' : 'NOT SET');

    const result = await utapi.uploadFiles([utFile]);
    return NextResponse.json({ result: JSON.stringify(result) });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
