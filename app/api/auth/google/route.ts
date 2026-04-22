import { NextRequest, NextResponse } from 'next/server';
import { workos, APP_URL } from '@/lib/workos';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { url, codeVerifier } = await workos.userManagement.getAuthorizationUrlWithPKCE({
      provider: 'GoogleOAuth',
      redirectUri: `${APP_URL}/api/auth/callback`,
      clientId: process.env.WORKOS_CLIENT_ID,
    });

    // Store codeVerifier in a short-lived HttpOnly cookie (5 min TTL)
    const response = NextResponse.redirect(url);
    response.cookies.set('pkce_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300, // 5 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.redirect(new URL('/login?error=google_failed', request.url));
  }
}