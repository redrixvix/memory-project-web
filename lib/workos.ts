import { WorkOS } from '@workos-inc/node';

export const workos = new WorkOS(process.env.WORKOS_API_KEY ?? '');

export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID ?? '';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? '';
export const CALLBACK_URL = `${APP_URL}/api/auth/callback`;