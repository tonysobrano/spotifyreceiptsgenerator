import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('spotify_access_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('time_range') ?? 'short_term';
  const limit = searchParams.get('limit') ?? '10';

  const res = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${encodeURIComponent(
      timeRange
    )}&limit=${encodeURIComponent(limit)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (res.status === 401) {
    return NextResponse.json({ error: 'token_expired' }, { status: 401 });
  }

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
