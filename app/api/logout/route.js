import { NextResponse } from 'next/server';

export async function GET(request) {
  const { origin } = new URL(request.url);
  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.delete('spotify_access_token');
  return res;
}
