import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({
      error: 'Missing GITHUB_CLIENT_ID environment variable in Vercel project settings.',
    });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const proto =
    (typeof req.headers['x-forwarded-proto'] === 'string'
      ? req.headers['x-forwarded-proto'].split(',')[0].trim()
      : '') || 'https';
  const host =
    (typeof req.headers['x-forwarded-host'] === 'string'
      ? req.headers['x-forwarded-host'].split(',')[0].trim()
      : '') ||
    req.headers.host ||
    'www.shiningblack.xyz';

  const isHttps = proto === 'https';
  const cookieParts = [
    `oauth_state=${state}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600',
    isHttps ? 'Secure' : '',
  ].filter(Boolean);

  res.setHeader('Set-Cookie', cookieParts.join('; '));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${proto}://${host}/api/callback`,
    scope: 'repo,user',
    state,
  });

  res.redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
}
