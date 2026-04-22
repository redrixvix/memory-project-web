import { NextRequest, NextResponse } from 'next/server';
import { workos, APP_URL } from '@/lib/workos';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Generate PKCE pair manually: store verifier as state (not cookie)
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');
    
    const authUrl = new URL('https://api.workos.com/user_management/authorize');
    authUrl.searchParams.set('client_id', process.env.WORKOS_CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', `${APP_URL}/api/auth/callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('provider', 'GoogleOAuth');
    authUrl.searchParams.set('state', JSON.stringify({ ver: state, cv: codeVerifier }));

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Google auth error:', error?.message, error?.code);
    return NextResponse.redirect(new URL('/login?error=google_failed', request.url));
  }
}