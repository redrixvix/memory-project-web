import { NextRequest, NextResponse } from 'next/server';
import { CALLBACK_URL, workos, WORKOS_CLIENT_ID } from '@/lib/workos';

const PKCE_VERIFIER_COOKIE = 'workos_pkce_verifier';
const AUTH_STATE_COOKIE = 'workos_auth_state';

function getScreenHint(request: NextRequest): 'sign-in' | 'sign-up' {
  return request.nextUrl.searchParams.get('screen_hint') === 'sign-up' ? 'sign-up' : 'sign-in';
}

export async function GET(request: NextRequest) {
  try {
    const params: Record<string, string> = {};
    const screenHint = getScreenHint(request);
    if (screenHint) {
      // Only pass screenHint for non-Google providers (authkit supports it, Google does not)
      params.screen_hint = screenHint;
    }

    const { url, codeVerifier, state } = await workos.userManagement.getAuthorizationUrlWithPKCE({
      clientId: WORKOS_CLIENT_ID,
      provider: 'GoogleOAuth',
      redirectUri: CALLBACK_URL,
      ...(Object.keys(params).length > 0 ? { providerQueryParams: params } : {}),
    });

    const response = NextResponse.redirect(url);
    const secure = process.env.NODE_ENV === 'production';

    response.cookies.set(PKCE_VERIFIER_COOKIE, codeVerifier, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    response.cookies.set(AUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('Google auth error:', error);
    return NextResponse.redirect(new URL('/login?error=google_failed', request.url));
  }
}
