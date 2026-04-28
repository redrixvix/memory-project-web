import { NextRequest, NextResponse } from 'next/server';
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos';
import { attachSessionCookie, completeAuth, getRequestMetadata } from '@/lib/auth';
import { readMobileAuthFlowToken } from '@/lib/mobile-auth-flow';

interface FinishBody {
  flowId?: string;
  code?: string;
  state?: string;
}

export async function POST(request: NextRequest) {
  let body: FinishBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const flowId = body.flowId;
  const code = body.code;
  const state = body.state;

  if (!flowId || !code || !state) {
    return NextResponse.json({ error: 'missing_flow_code_or_state' }, { status: 400 });
  }

  let flow;
  try {
    flow = readMobileAuthFlowToken(flowId);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (state !== flow.state) {
    return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  }

  try {
    const result = await workos.userManagement.authenticateWithCode({
      clientId: WORKOS_CLIENT_ID,
      code,
      codeVerifier: flow.codeVerifier,
      ...getRequestMetadata(request),
    });

    if (!result.user) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
    }

    const { user, sessionId } = await completeAuth({
      workosUser: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        profilePictureUrl: result.user.profilePictureUrl ?? null,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
    attachSessionCookie(response, sessionId);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Mobile Google auth finish error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
