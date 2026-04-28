import crypto from 'crypto';

interface MobileAuthFlow {
  codeVerifier: string;
  state: string;
  expiresAt: number;
}

const FLOW_TTL_MS = 10 * 60 * 1000;

function getSigningSecret(): string {
  const secret =
    process.env.WORKOS_COOKIE_PASSWORD ||
    process.env.WORKOS_API_KEY ||
    process.env.MOBILE_AUTH_FLOW_SECRET;

  if (!secret) {
    throw new Error('Missing secret for mobile auth flow signing');
  }

  return secret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(payload: string): string {
  return crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('base64url');
}

export function createMobileAuthFlowToken(input: {
  codeVerifier: string;
  state: string;
}): string {
  const payload = base64UrlEncode(
    JSON.stringify({
      codeVerifier: input.codeVerifier,
      state: input.state,
      expiresAt: Date.now() + FLOW_TTL_MS,
    } satisfies MobileAuthFlow)
  );

  return `${payload}.${sign(payload)}`;
}

export function readMobileAuthFlowToken(flowId: string): MobileAuthFlow {
  const [payload, signature] = flowId.split('.');
  if (!payload || !signature) {
    throw new Error('Invalid mobile auth flow');
  }

  const expectedSignature = sign(payload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error('Invalid mobile auth flow signature');
  }

  const flow = JSON.parse(base64UrlDecode(payload)) as MobileAuthFlow;
  if (!flow.codeVerifier || !flow.state || !flow.expiresAt) {
    throw new Error('Invalid mobile auth flow payload');
  }

  if (Date.now() > flow.expiresAt) {
    throw new Error('Mobile auth flow expired');
  }

  return flow;
}
