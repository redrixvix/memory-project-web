import { NextRequest, NextResponse } from 'next/server';
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos';
import {
  attachSessionCookie,
  completeAuth,
  getRequestMetadata,
} from '@/lib/auth';

const PKCE_VERIFIER_COOKIE = 'workos_pkce_verifier';
const AUTH_STATE_COOKIE = 'workos_auth_state';
const LEGACY_PKCE_COOKIE = 'pkce_verifier';

function getCodeVerifier(request: NextRequest, rawState: string | null): string | undefined {
  if (rawState) {
    try {
      const parsed = JSON.parse(rawState) as { cv?: string };
      if (parsed.cv) {
        return parsed.cv;
      }
    } catch {
      // Not a legacy JSON state payload.
    }
  }

  return (
    request.cookies.get(PKCE_VERIFIER_COOKIE)?.value ||
    request.cookies.get(LEGACY_PKCE_COOKIE)?.value ||
    undefined
  );
}

function isStateValid(request: NextRequest, rawState: string | null): boolean {
  const expectedState = request.cookies.get(AUTH_STATE_COOKIE)?.value;
  if (!expectedState) {
    return true;
  }

  return rawState === expectedState;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const rawState = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  if (!isStateValid(request, rawState)) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  }

  const codeVerifier = getCodeVerifier(request, rawState);
  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/login?error=missing_verifier', request.url));
  }

  try {
    const result = await workos.userManagement.authenticateWithCode({
      clientId: WORKOS_CLIENT_ID,
      code,
      codeVerifier,
      ...getRequestMetadata(request),
    });

    if (!result.user) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    const { redirectUrl, sessionId } = await completeAuth({
      workosUser: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        profilePictureUrl: result.user.profilePictureUrl ?? null,
      },
    });

    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url));
    attachSessionCookie(redirectResponse, sessionId);
    redirectResponse.cookies.delete(PKCE_VERIFIER_COOKIE);
    redirectResponse.cookies.delete(AUTH_STATE_COOKIE);
    redirectResponse.cookies.delete(LEGACY_PKCE_COOKIE);

    return redirectResponse;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=callback_failed&detail=${encodeURIComponent(message)}`, request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
