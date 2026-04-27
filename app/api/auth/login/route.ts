import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getWorkOS, WORKOS_CLIENT_ID } from '@/lib/workos';
import {
  applyAppCors,
  attachSessionCookie,
  completeAuth,
  getRequestMetadata,
  hashLegacyPassword,
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
}

interface LegacyUserRecord {
  id: number;
  email: string;
  name: string;
  password_hash: string | null;
  google_id: string | null;
}

function getErrorCode(error: WorkOSAuthError): string | undefined {
  return error.code || error.error;
}

function isInvalidCredentialsError(error: WorkOSAuthError): boolean {
  const code = getErrorCode(error);
  if (code === 'invalid_credentials') {
    return true;
  }

  const message = `${error.message ?? ''} ${error.error_description ?? ''}`.toLowerCase();
  return message.includes('invalid credentials');
}

async function migrateLegacyPasswordUser(
  email: string,
  password: string,
  metadata: { ipAddress?: string; userAgent?: string }
) {
  const [legacyUser] = await sql<LegacyUserRecord[]>`
    SELECT id, email, name, password_hash, google_id
    FROM users
    WHERE LOWER(email) = ${email}
  `;

  if (!legacyUser?.password_hash) {
    return null;
  }

  if (legacyUser.password_hash !== hashLegacyPassword(password)) {
    return null;
  }

  const workos = getWorkOS();
  const { firstName, lastName } = splitName(legacyUser.name);
  const users = await workos.userManagement.listUsers({ email, limit: 1 });
  const existingWorkOSUser = users.data[0];

  if (existingWorkOSUser) {
    await workos.userManagement.updateUser({
      userId: existingWorkOSUser.id,
      password,
      emailVerified: true,
      firstName: existingWorkOSUser.firstName ?? firstName,
      lastName: existingWorkOSUser.lastName ?? lastName,
    });
  } else {
    await workos.userManagement.createUser({
      email,
      password,
      firstName,
      lastName,
      emailVerified: true,
    });
  }

  return workos.userManagement.authenticateWithPassword({
    clientId: WORKOS_CLIENT_ID,
    email,
    password,
    ...metadata,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    const metadata = getRequestMetadata(request);
    const workos = getWorkOS();

    let result;

    try {
      result = await workos.userManagement.authenticateWithPassword({
        clientId: WORKOS_CLIENT_ID,
        email: normalizedEmail,
        password: String(password),
        ...metadata,
      });
    } catch (error) {
      const authError = error as WorkOSAuthError;

      if (isInvalidCredentialsError(authError)) {
        result = await migrateLegacyPasswordUser(normalizedEmail, String(password), metadata);
      }

      if (!result) {
        throw error;
      }
    }

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
    const code = getErrorCode(authError);

    if (code === 'email_verification_required' && authError.pending_authentication_token) {
      return NextResponse.json(
        {
          requires_email_verification: true,
          pending_authentication_token: authError.pending_authentication_token,
          email: authError.email,
          error: 'Check your email for a verification code to finish signing in.',
        },
        { status: 202 }
      );
    }

    if (isInvalidCredentialsError(authError)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: authError.error_description || authError.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
