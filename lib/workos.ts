import { WorkOS } from '@workos-inc/node';

export const workos = new WorkOS(process.env.WORKOS_API_KEY || 'sk_test_...');

export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID || 'client_01KPTJ9V6VTS6BEPNHFAKBJQB1';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://web-redrixvixs-projects.vercel.app';
export const CALLBACK_URL = `${APP_URL}/api/auth/callback`;