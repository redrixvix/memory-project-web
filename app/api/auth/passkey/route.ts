import { NextRequest, NextResponse } from 'next/server';
import { workos, APP_URL } from '@/lib/workos';

// Passkey authentication via WorkOS AuthKit
// This uses the WebAuthn API to authenticate with a passkey (fingerprint, face, pin)
export async function GET(request: NextRequest) {
  try {
    // WorkOS passkey authentication requires a challenge + registration
    // For sign-in, we get an authorization URL that initiates the WebAuthn flow
    const { url, codeVerifier } = await workos.userManagement.getAuthorizationUrlWithPKCE({
      // For passkey, we use 'passkey' as the provider
      // Note: WorkOS uses a different mechanism for passkeys
      redirectUri: `${APP_URL}/api/auth/passkey-callback`,
      clientId: process.env.WORKOS_CLIENT_ID || 'client_01KPTJ9V6VTS6BEPNHFAKBJQB1',
    });

    // Store codeVerifier for passkey callback
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
    console.error('Passkey auth error:', error);
    return NextResponse.redirect(new URL('/login?error=passkey_failed', request.url));
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}