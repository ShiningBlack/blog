import type { VercelRequest, VercelResponse } from '@vercel/node';

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => {
        const idx = part.indexOf('=');
        if (idx === -1) return null;
        return [part.slice(0, idx).trim(), decodeURIComponent(part.slice(idx + 1).trim())];
      })
      .filter((entry): entry is [string, string] => entry !== null),
  );
}

function renderAuthScript(status: 'success' | 'error', payload: Record<string, unknown>): string {
  const safeJson = JSON.stringify(payload).replace(/</g, '\\u003c');
  const messagePrefix = `authorization:github:${status}:`;
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <title>GitHub 授权回调</title>
  </head>
  <body>
    <p>${status === 'success' ? '授权成功，正在返回后台...' : '授权失败，请检查 OAuth 配置。'}</p>
    <script>
      (function () {
        var payload = ${safeJson};
        var msg = ${JSON.stringify(messagePrefix)} + JSON.stringify(payload);
        function receiveMessage(e) {
          window.opener.postMessage(msg, e.origin);
          window.removeEventListener('message', receiveMessage, false);
          window.close();
        }
        if (window.opener) {
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        }
      })();
    </script>
  </body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res
      .status(500)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(renderAuthScript('error', { error: 'Missing GitHub OAuth environment variables.' }));
  }

  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const cookies = parseCookies(req.headers.cookie);

  res.setHeader('Set-Cookie', 'oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

  if (!code || !state || !cookies.oauth_state || state !== cookies.oauth_state) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(renderAuthScript('error', { error: 'Invalid OAuth state or missing code.' }));
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !data.access_token) {
      return res
        .status(401)
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .send(
          renderAuthScript('error', {
            error: data.error_description || data.error || 'Failed to retrieve GitHub access token.',
          }),
        );
    }

    return res
      .status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(renderAuthScript('success', { token: data.access_token, provider: 'github' }));
  } catch (err) {
    return res
      .status(500)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(
        renderAuthScript('error', {
          error: err instanceof Error ? err.message : 'Unexpected OAuth error.',
        }),
      );
  }
}
