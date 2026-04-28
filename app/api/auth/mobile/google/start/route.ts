import { NextResponse } from 'next/server';
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos';
import { createMobileAuthFlowToken } from '@/lib/mobile-auth-flow';

const MOBILE_REDIRECT_URI = 'memoryproject://oauth/callback';

export async function POST() {
  try {
    const { url, codeVerifier, state } = await workos.userManagement.getAuthorizationUrlWithPKCE({
      clientId: WORKOS_CLIENT_ID,
      provider: 'GoogleOAuth',
      redirectUri: MOBILE_REDIRECT_URI,
    });

    return NextResponse.json({
      authorizationUrl: url,
      flowId: createMobileAuthFlowToken({ codeVerifier, state }),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Mobile Google auth start error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
