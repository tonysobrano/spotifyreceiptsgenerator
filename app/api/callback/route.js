import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const storedState = request.cookies.get('spotify_auth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${origin}/?error=state_mismatch`);
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(`token_exchange_failed:${text}`)}`
    );
  }

  const tokenData = await tokenRes.json();
  const { access_token, expires_in } = tokenData;

  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set('spotify_access_token', access_token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: expires_in ?? 3600,
  });
  res.cookies.delete('spotify_auth_state');
  return res;
}
