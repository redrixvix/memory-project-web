import { NextRequest, NextResponse } from 'next/server';
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos';
import {
  applyAppCors,
  attachSessionCookie,
  completeAuth,
  getRequestMetadata,
  normalizeEmail,
} from '@/lib/auth';

interface WorkOSAuthError {
  code?: string;
  error?: string;
  error_description?: string;
  message?: string;
}

async function authenticateMagic(code: string, email: string, request: NextRequest) {
  return workos.userManagement.authenticateWithMagicAuth({
    clientId: WORKOS_CLIENT_ID,
    code,
    email,
    ...getRequestMetadata(request),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json({ error: 'Code and email are required' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const result = await authenticateMagic(String(code).trim(), normalizedEmail, request);

    const { user, redirectUrl, sessionId } = await completeAuth({
      workosUser: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        profilePictureUrl: result.user.profilePictureUrl ?? null,
      },
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      redirect_url: redirectUrl,
    });

    applyAppCors(response);
    attachSessionCookie(response, sessionId);

    return response;
  } catch (error) {
    const authError = error as WorkOSAuthError;
    console.error('Magic verify error:', error);
    return NextResponse.json(
      {
        error:
          authError.error_description ||
          authError.message ||
          'Invalid or expired magic link. Please request a new one.',
      },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    if (!code || !email) {
      return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
    }

    const normalizedEmail = normalizeEmail(email);
    const result = await authenticateMagic(code, normalizedEmail, request);

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

    return redirectResponse;
  } catch (error) {
    console.error('Magic verify GET error:', error);
    return NextResponse.redirect(new URL('/login?error=verify_failed', request.url));
  }
}
