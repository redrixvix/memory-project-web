import { type NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';

export interface WorkOSUserProfile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}

interface LocalUserRecord {
  id: number;
  email: string;
  name: string;
  invite_pending?: boolean | null;
}

export function normalizeEmail(email: string): string {
  return String(email).trim().toLowerCase();
}

export function splitName(name: string): { firstName?: string; lastName?: string } {
  const normalized = String(name).trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return {};
  }

  const [firstName, ...rest] = normalized.split(' ');
  const lastName = rest.join(' ').trim();

  return {
    firstName: firstName || undefined,
    lastName: lastName || undefined,
  };
}

export function buildDisplayName(user: WorkOSUserProfile): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email.split('@')[0];
}

export function hashLegacyPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

export function getRequestMetadata(request: NextRequest): { ipAddress?: string; userAgent?: string } {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}

export async function syncLocalUserFromWorkOS(
  workosUser: WorkOSUserProfile,
  options?: { clearLegacyPassword?: boolean }
): Promise<LocalUserRecord> {
  const email = normalizeEmail(workosUser.email);
  const name = buildDisplayName(workosUser);

  const [existing] = await sql<LocalUserRecord[]>`
    SELECT id, email, name, invite_pending
    FROM users
    WHERE LOWER(email) = ${email}
  `;

  if (existing) {
    if (options?.clearLegacyPassword) {
      const [updated] = await sql<LocalUserRecord[]>`
        UPDATE users
        SET
          name = ${name},
          google_id = ${workosUser.id},
          profile_image_url = COALESCE(${workosUser.profilePictureUrl ?? null}, profile_image_url),
          password_hash = NULL
        WHERE id = ${existing.id}
        RETURNING id, email, name, invite_pending
      `;

      return updated;
    }

    const [updated] = await sql<LocalUserRecord[]>`
      UPDATE users
      SET
        name = ${name},
        google_id = ${workosUser.id},
        profile_image_url = COALESCE(${workosUser.profilePictureUrl ?? null}, profile_image_url)
      WHERE id = ${existing.id}
      RETURNING id, email, name, invite_pending
    `;

    return updated;
  }

  const [created] = await sql<LocalUserRecord[]>`
    INSERT INTO users (email, name, password_hash, google_id, profile_image_url)
    VALUES (${email}, ${name}, NULL, ${workosUser.id}, ${workosUser.profilePictureUrl ?? null})
    RETURNING id, email, name, invite_pending
  `;

  return created;
}

export async function acceptPendingInvites(email: string): Promise<number | null> {
  const normalizedEmail = normalizeEmail(email);

  const pending = await sql<{ book_id: number }[]>`
    UPDATE book_members
    SET user_id = (
      SELECT id FROM users WHERE email = ${normalizedEmail}
    ), joined_at = CURRENT_TIMESTAMP, invite_token = NULL
    WHERE invite_email = ${normalizedEmail}
      AND joined_at IS NULL
    RETURNING book_id
  `;

  if (pending.length > 0) {
    return pending[0].book_id;
  }

  return null;
}

export async function createLocalSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const sessionIdHash = hashSessionId(sessionId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO auth_sessions (user_id, workos_session_id, expires_at)
    VALUES (${userId}, ${sessionIdHash}, ${expiresAt})
  `;

  return sessionId;
}

export function attachSessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export function applyAppCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://web-redrixvixs-projects.vercel.app');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
}

export async function completeAuth({
  workosUser,
  clearLegacyPassword,
}: {
  workosUser: WorkOSUserProfile;
  clearLegacyPassword?: boolean;
}): Promise<{ user: LocalUserRecord; redirectUrl: string; sessionId: string }> {
  const user = await syncLocalUserFromWorkOS(workosUser, { clearLegacyPassword });
  const bookId = await acceptPendingInvites(workosUser.email);
  const sessionId = await createLocalSession(user.id);

  return {
    user,
    redirectUrl: bookId ? `/books/${bookId}` : '/dashboard',
    sessionId,
  };
}
