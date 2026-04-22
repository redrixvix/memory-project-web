import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import sql from '@/lib/db';
import crypto from 'crypto';

// Simple in-memory rate limiting: email -> lastRequestTimestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit check
    const lastRequest = rateLimitMap.get(normalizedEmail);
    if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Please wait a bit before requesting another magic link.' },
        { status: 429 }
      );
    }
    rateLimitMap.set(normalizedEmail, Date.now());

    // Create magic auth via WorkOS
    await workos.userManagement.createMagicAuth({
      email: normalizedEmail,
    });

    // CORS for Expo app
    const response = NextResponse.json({ message: 'Check your email for a magic link' });
    response.headers.set('Access-Control-Allow-Origin', 'https://web-redrixvixs-projects.vercel.app');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Cookie');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  } catch (error: any) {
    console.error('Magic initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}