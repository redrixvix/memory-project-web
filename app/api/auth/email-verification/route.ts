import { NextRequest, NextResponse } from 'next/server';
import { getWorkOS, WORKOS_CLIENT_ID } from '@/lib/workos';
import {
  applyAppCors,
  attachSessionCookie,
  completeAuth,
  getRequestMetadata,
} from '@/lib/auth';

interface WorkOSAuthError {
  code?: string;
  error?: string;
  error_description?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { code, pendingAuthenticationToken } = await request.json();

    if (!code || !pendingAuthenticationToken) {
      return NextResponse.json(
        { error: 'Code and pending authentication token are required' },
        { status: 400 }
      );
    }

    const result = await getWorkOS().userManagement.authenticateWithEmailVerification({
      clientId: WORKOS_CLIENT_ID,
      code: String(code).trim(),
      pendingAuthenticationToken: String(pendingAuthenticationToken).trim(),
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

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      redirect_url: redirectUrl,
    });

    applyAppCors(response);
    attachSessionCookie(response, sessionId);

    return response;
  } catch (error) {
    const authError = error as WorkOSAuthError;
    console.error('Email verification auth error:', error);
    return NextResponse.json(
      { error: authError.error_description || authError.message || 'Failed to verify email' },
      { status: 401 }
    );
  }
}
