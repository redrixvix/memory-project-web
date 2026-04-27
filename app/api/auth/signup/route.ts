import { NextRequest, NextResponse } from 'next/server';
import { getWorkOS, WORKOS_CLIENT_ID } from '@/lib/workos';
import {
  applyAppCors,
  attachSessionCookie,
  completeAuth,
  getRequestMetadata,
  normalizeEmail,
  splitName,
} from '@/lib/auth';

interface WorkOSAuthError {
  code?: string;
  error?: string;
  error_description?: string;
  message?: string;
  pending_authentication_token?: string;
  email?: string;
  errors?: Array<{ field?: string; message?: string; code?: string }>;
}

function getErrorCode(error: WorkOSAuthError): string | undefined {
  return error.code || error.error;
}

function isDuplicateEmailError(error: WorkOSAuthError): boolean {
  if (error.errors?.some((entry) => entry.field === 'email')) {
    return true;
  }

  const message = `${error.message ?? ''} ${error.error_description ?? ''}`.toLowerCase();
  return message.includes('already exists') || message.includes('already been taken');
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedName = String(name).trim();
    const { firstName, lastName } = splitName(normalizedName);
    const workos = getWorkOS();

    await workos.userManagement.createUser({
      email: normalizedEmail,
      password: String(password),
      firstName,
      lastName,
    });

    const result = await workos.userManagement.authenticateWithPassword({
      clientId: WORKOS_CLIENT_ID,
      email: normalizedEmail,
      password: String(password),
      ...getRequestMetadata(request),
    });

    const { user, redirectUrl, sessionId } = await completeAuth({
      workosUser: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        profilePictureUrl: result.user.profilePictureUrl ?? null,
      },
      clearLegacyPassword: true,
    });

    const response = NextResponse.json({ user, redirect_url: redirectUrl }, { status: 201 });
    applyAppCors(response);
    attachSessionCookie(response, sessionId);

    return response;
  } catch (error) {
    const authError = error as WorkOSAuthError;
    const code = getErrorCode(authError);

    if (isDuplicateEmailError(authError)) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    if (code === 'email_verification_required' && authError.pending_authentication_token) {
      return NextResponse.json(
        {
          requires_email_verification: true,
          pending_authentication_token: authError.pending_authentication_token,
          email: authError.email,
          error: 'Check your email for a verification code to finish creating your account.',
        },
        { status: 202 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: authError.error_description || authError.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
