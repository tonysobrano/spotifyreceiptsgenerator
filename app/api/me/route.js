import { NextResponse } from 'next/server';

export async function GET(request) {
  const token = request.cookies.get('spotify_access_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    return NextResponse.json({ error: 'token_expired' }, { status: 401 });
  }

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({
    display_name: data.display_name,
    images: data.images ?? [],
    country: data.country ?? null,
    external_urls: data.external_urls ?? {},
    id: data.id,
  });
}
