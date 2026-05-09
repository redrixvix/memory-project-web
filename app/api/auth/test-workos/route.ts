import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    WORKOS_API_KEY: process.env.WORKOS_API_KEY ? 'SET (' + process.env.WORKOS_API_KEY.substring(0, 10) + '...)' : 'MISSING',
    WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID ? 'SET (' + process.env.WORKOS_CLIENT_ID.substring(0, 10) + '...)' : 'MISSING',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  });
}
