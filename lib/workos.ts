import { WorkOS } from '@workos-inc/node';

let _workos: WorkOS | undefined;

export function getWorkOS(): WorkOS {
  if (!_workos) {
    const apiKey = process.env.WORKOS_API_KEY;
    const clientId = process.env.WORKOS_CLIENT_ID;
    if (!apiKey || !clientId) {
      throw new Error(`WORKOS_API_KEY and WORKOS_CLIENT_ID must both be set`);
    }
    _workos = new WorkOS(apiKey, { clientId });
  }
  return _workos;
}

// Legacy export for code that imports `workos` directly
// Use getWorkOS() in new code for lazy initialization
export const workos = {
  get userManagement() { return getWorkOS().userManagement; }
} as const;

export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID ?? '';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? '';
export const CALLBACK_URL = `${APP_URL}/api/auth/callback`;