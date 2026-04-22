import { NextRequest, NextResponse } from 'next/server';
import { workos, APP_URL } from '@/lib/workos';

// Passkey authentication via WorkOS AuthKit
// AuthKit is WorkOS's embedded identity platform that supports passkeys natively.
// The hosted UI handles passkey registration and authentication via WebAuthn.
export async function GET(request: NextRequest) {
  try {
    const { url, codeVerifier } = await workos.userManagement.getAuthorizationUrlWithPKCE({
      provider: 'authkit',
      redirectUri: `${APP_URL}/api/auth/callback`,
      clientId: process.env.WORKOS_CLIENT_ID || 'client_01KPTJ9V6VTS6BEPNHFAKBJQB1',
    });

    // Store codeVerifier for callback verification (5 min TTL)
    const response = NextResponse.redirect(url);
    response.cookies.set('pkce_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Passkey/AuthKit auth error:', error);
    return NextResponse.redirect(new URL('/login?error=authkit_failed', request.url));
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
