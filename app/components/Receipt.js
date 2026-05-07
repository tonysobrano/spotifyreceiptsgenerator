'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TIME_RANGES = [
  { value: 'short_term', label: 'Last Month' },
  { value: 'medium_term', label: 'Last 6 Months' },
  { value: 'long_term', label: 'All Time' },
];

const TYPES = [
  { value: 'tracks', label: 'Tracks' },
  { value: 'artists', label: 'Artists' },
  { value: 'genres', label: 'Genres' },
];

const PAPER = '#f5f1e8';
const INK = '#1a1a1a';

function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatHMS(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatNum(n) {
  return n.toLocaleString('en-US');
}

function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ZigZag({ flip }) {
  return (
    <svg
      viewBox="0 0 40 8"
      preserveAspectRatio="none"
      width="100%"
      height="8"
      style={{
        display: 'block',
        transform: flip ? 'scaleY(-1)' : undefined,
      }}
    >
      <polygon
        points="0,8 4,0 8,8 12,0 16,8 20,0 24,8 28,0 32,8 36,0 40,8"
        fill={PAPER}
      />
    </svg>
  );
}

function Barcode({ seed }) {
  const rnd = useMemo(() => seedFrom(seed), [seed]);
  const bars = useMemo(() => {
    const out = [];
    for (let i = 0; i < 60; i++) {
      out.push({ w: 1 + Math.floor(rnd() * 3), gap: 1 + Math.floor(rnd() * 2) });
    }
    return out;
  }, [rnd]);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: 44,
        gap: 0,
        justifyContent: 'center',
      }}
    >
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex' }}>
          <div style={{ width: b.w, height: 44, background: INK }} />
          <div style={{ width: b.gap, height: 44 }} />
        </div>
      ))}
    </div>
  );
}

function Stars({ value }) {
  const filled = Math.round(value);
  const total = 5;
  return (
    <span style={{ letterSpacing: '2px' }}>
      {'★'.repeat(Math.max(0, Math.min(total, filled)))}
      {'☆'.repeat(Math.max(0, total - filled))}
    </span>
  );
}

function aggregateGenres(artists) {
  const counts = new Map();
  for (const a of artists) {
    for (const g of a.genres ?? []) {
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export default function Receipt() {
  const [range, setRange] = useState('short_term');
  const [type, setType] = useState('tracks');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [now, setNow] = useState(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    setOrderNumber(Math.floor(1000 + Math.random() * 9000).toString());
    setNow(new Date());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const dataUrl =
      type === 'tracks'
        ? `/api/top-tracks?time_range=${range}&limit=10`
        : type === 'artists'
        ? `/api/top-artists?time_range=${range}&limit=10`
        : `/api/top-artists?time_range=${range}&limit=50`;

    Promise.all([fetch(dataUrl), fetch('/api/me')])
      .then(async ([dataRes, meRes]) => {
        if (
          dataRes.status === 401 ||
          meRes.status === 401 ||
          meRes.status === 403
        ) {
          window.location.href = '/api/login';
          return;
        }
        if (!dataRes.ok) {
          const body = await dataRes.text();
          throw new Error(`Failed to fetch (${dataRes.status}): ${body}`);
        }
        const data = await dataRes.json();
        const meData = meRes.ok ? await meRes.json() : null;
        if (cancelled) return;
        if (type === 'tracks') {
          setTracks(data.items || []);
          setArtists([]);
        } else {
          setArtists(data.items || []);
          setTracks([]);
        }
        setMe(meData);
        setLoading(false);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [range, type]);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(receiptRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = `spotify-receipt-${type}-${range}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const rangeLabel = TIME_RANGES.find((r) => r.value === range)?.label;
  const typeLabel = TYPES.find((t) => t.value === type)?.label;

  const dateStr = now
    ? now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : '';
  const timeStr = now
    ? now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const cashier = me?.display_name || 'GUEST';
  const country = me?.country || 'US';
  const profileUrl = me?.external_urls?.spotify || 'https://open.spotify.com';
  const avatarUrl = me?.images?.[0]?.url;

  const genres = useMemo(() => aggregateGenres(artists), [artists]);

  const hasData =
    (type === 'tracks' && tracks.length > 0) ||
    (type === 'artists' && artists.length > 0) ||
    (type === 'genres' && genres.length > 0);

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4">
      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              type === t.value
                ? 'bg-green-500 text-black'
                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {TIME_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
              range === r.value
                ? 'bg-white text-black'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-neutral-400">Loading your receipt…</p>}
      {error && (
        <p className="text-red-400 max-w-md text-center">{error}</p>
      )}

      {!loading && !error && hasData && (
        <>
          <div ref={receiptRef} className="w-full max-w-sm">
            <ZigZag />
            <div
              className="receipt-paper receipt-ink font-mono text-ink"
              style={{ padding: '20px 24px' }}
            >
              <div className="text-center">
                <h1
                  className="font-display tracking-widest leading-none"
                  style={{ fontSize: '44px' }}
                >
                  SPOTIFY
                </h1>
                <h2
                  className="font-display tracking-widest leading-none"
                  style={{ fontSize: '32px', marginTop: '-4px' }}
                >
                  RECEIPTS
                </h2>
                <p className="text-[10px] mt-2 tracking-widest">
                  STORE #SP-{country}-001 · DEPT: {typeLabel.toUpperCase()}
                </p>
              </div>

              <div className="divider-dashed my-3" />

              <div className="flex items-center gap-3">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt=""
                    crossOrigin="anonymous"
                    width={44}
                    height={44}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: `1px solid ${INK}`,
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div className="text-[11px] leading-tight flex-1">
                  <div>
                    <span className="opacity-70">CASHIER:</span>{' '}
                    <span className="font-bold uppercase">{cashier}</span>
                  </div>
                  <div>
                    <span className="opacity-70">PERIOD:</span>{' '}
                    <span className="uppercase">{rangeLabel}</span>
                  </div>
                  <div>
                    <span className="opacity-70">DATE:</span> {dateStr} {timeStr}
                  </div>
                  <div>
                    <span className="opacity-70">ORDER:</span> #{orderNumber}
                  </div>
                </div>
              </div>

              <div className="divider-dashed my-3" />

              {type === 'tracks' && (
                <TracksSection tracks={tracks} />
              )}
              {type === 'artists' && (
                <ArtistsSection artists={artists} />
              )}
              {type === 'genres' && (
                <GenresSection genres={genres.slice(0, 10)} totalArtists={artists.length} />
              )}

              <div className="divider-dashed my-4" />

              <div className="text-center text-[11px]">
                <p>CARD #: **** **** **** {orderNumber}</p>
                <p className="mt-1">
                  AUTH: {orderNumber}
                  {country?.charCodeAt(0) || 65}
                  {country?.charCodeAt(1) || 65}
                </p>
              </div>

              <div className="mt-4">
                <Barcode seed={`${orderNumber}-${type}-${range}`} />
                <p className="text-center text-[10px] tracking-widest mt-1">
                  *{orderNumber}
                  {type.toUpperCase()}
                  {range.toUpperCase().replace('_', '')}*
                </p>
              </div>

              <div className="flex justify-center mt-3">
                <div style={{ background: PAPER, padding: 4 }}>
                  <QRCodeSVG
                    value={profileUrl}
                    size={88}
                    bgColor={PAPER}
                    fgColor={INK}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>

              <p className="text-center text-[10px] mt-3 tracking-widest">
                SCAN TO VISIT PROFILE
              </p>

              <div className="divider-dashed my-3" />

              <p className="text-center text-[12px] tracking-widest font-bold">
                THANK YOU FOR LISTENING
              </p>
              <p className="text-center text-[10px] mt-1 opacity-70">
                ♪ ♫ ♪ ♫ ♪ ♫ ♪
              </p>
            </div>
            <ZigZag flip />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleDownload}
              className="bg-white text-black font-bold py-2 px-5 rounded-full hover:bg-neutral-200 transition"
            >
              Download PNG
            </button>
            <a
              href="/api/logout"
              className="bg-neutral-800 text-white py-2 px-5 rounded-full hover:bg-neutral-700 transition"
            >
              Log out
            </a>
          </div>
        </>
      )}
    </main>
  );
}

function TracksSection({ tracks }) {
  const subtotalMs = tracks.reduce((s, t) => s + t.duration_ms, 0);
  const taxMs = Math.floor(subtotalMs * 0.0666);
  const tipMs = Math.floor(subtotalMs * 0.2);
  const totalMs = subtotalMs + taxMs + tipMs;
  const avgPop =
    tracks.reduce((s, t) => s + (t.popularity ?? 0), 0) / tracks.length;
  const rating = (avgPop / 100) * 5;

  return (
    <>
      <div className="flex text-[10px] font-bold tracking-wider mb-1">
        <span style={{ width: 22 }}>QTY</span>
        <span style={{ width: 28 }} />
        <span className="flex-1">TRACK</span>
        <span>TIME</span>
      </div>
      <div className="divider-dashed mb-3" />
      <ul className="text-[12px] space-y-3">
        {tracks.map((t, i) => {
          const art =
            t.album?.images?.[t.album.images.length - 1]?.url ||
            t.album?.images?.[0]?.url;
          return (
            <li key={t.id ?? i} className="flex gap-2 items-start">
              <span style={{ width: 22 }} className="font-bold">
                {String(i + 1).padStart(2, '0')}
              </span>
              {art ? (
                <img
                  src={art}
                  alt=""
                  crossOrigin="anonymous"
                  width={28}
                  height={28}
                  style={{
                    width: 28,
                    height: 28,
                    objectFit: 'cover',
                    border: `1px solid ${INK}`,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <span style={{ width: 28 }} />
              )}
              <div className="flex-1 min-w-0 pr-2">
                <div className="uppercase break-words leading-tight font-bold">
                  {t.name}
                </div>
                <div className="text-[10px] uppercase opacity-75 leading-tight">
                  {t.artists.map((a) => a.name).join(', ')}
                </div>
              </div>
              <span className="font-bold whitespace-nowrap">
                {formatMs(t.duration_ms)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="divider-dashed my-4" />
      <div className="text-[12px] space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{formatHMS(subtotalMs)}</span>
        </div>
        <div className="flex justify-between">
          <span>VIBES TAX (6.66%)</span>
          <span>{formatHMS(taxMs)}</span>
        </div>
        <div className="flex justify-between">
          <span>TIP (20%)</span>
          <span>{formatHMS(tipMs)}</span>
        </div>
        <div className="divider-dashed my-2" />
        <div className="flex justify-between font-bold text-[14px]">
          <span>TOTAL</span>
          <span>{formatHMS(totalMs)}</span>
        </div>
        <div className="flex justify-between">
          <span>RATING</span>
          <span>
            <Stars value={rating} /> {rating.toFixed(1)}/5
          </span>
        </div>
        <div className="flex justify-between">
          <span>ITEMS</span>
          <span>{tracks.length}</span>
        </div>
      </div>
    </>
  );
}

function ArtistsSection({ artists }) {
  const totalFollowers = artists.reduce(
    (s, a) => s + (a.followers?.total ?? 0),
    0
  );
  const avgPop =
    artists.reduce((s, a) => s + (a.popularity ?? 0), 0) / artists.length;
  const rating = (avgPop / 100) * 5;
  const uniqueGenres = new Set();
  artists.forEach((a) => (a.genres ?? []).forEach((g) => uniqueGenres.add(g)));

  return (
    <>
      <div className="flex text-[10px] font-bold tracking-wider mb-1">
        <span style={{ width: 22 }}>QTY</span>
        <span style={{ width: 36 }} />
        <span className="flex-1">ARTIST</span>
        <span>POP</span>
      </div>
      <div className="divider-dashed mb-3" />
      <ul className="text-[12px] space-y-3">
        {artists.map((a, i) => {
          const img =
            a.images?.[a.images.length - 1]?.url || a.images?.[0]?.url;
          const topGenre = a.genres?.[0];
          return (
            <li key={a.id ?? i} className="flex gap-2 items-start">
              <span style={{ width: 22 }} className="font-bold">
                {String(i + 1).padStart(2, '0')}
              </span>
              {img ? (
                <img
                  src={img}
                  alt=""
                  crossOrigin="anonymous"
                  width={36}
                  height={36}
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'cover',
                    border: `1px solid ${INK}`,
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <span style={{ width: 36 }} />
              )}
              <div className="flex-1 min-w-0 pr-2">
                <div className="uppercase break-words leading-tight font-bold">
                  {a.name}
                </div>
                <div className="text-[10px] uppercase opacity-75 leading-tight">
                  {topGenre || '—'} · {formatNum(a.followers?.total ?? 0)} FANS
                </div>
              </div>
              <span className="font-bold whitespace-nowrap">
                {a.popularity ?? 0}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="divider-dashed my-4" />
      <div className="text-[12px] space-y-1">
        <div className="flex justify-between">
          <span>UNIQUE GENRES</span>
          <span>{uniqueGenres.size}</span>
        </div>
        <div className="flex justify-between">
          <span>TOTAL FANS</span>
          <span>{formatNum(totalFollowers)}</span>
        </div>
        <div className="divider-dashed my-2" />
        <div className="flex justify-between font-bold text-[14px]">
          <span>AVG POP</span>
          <span>{Math.round(avgPop)}/100</span>
        </div>
        <div className="flex justify-between">
          <span>RATING</span>
          <span>
            <Stars value={rating} /> {rating.toFixed(1)}/5
          </span>
        </div>
        <div className="flex justify-between">
          <span>ITEMS</span>
          <span>{artists.length}</span>
        </div>
      </div>
    </>
  );
}

function GenresSection({ genres, totalArtists }) {
  const totalCount = genres.reduce((s, g) => s + g.count, 0);
  const max = genres[0]?.count ?? 1;
  return (
    <>
      <div className="flex text-[10px] font-bold tracking-wider mb-1">
        <span style={{ width: 22 }}>QTY</span>
        <span className="flex-1">GENRE</span>
        <span>HITS</span>
      </div>
      <div className="divider-dashed mb-3" />
      <ul className="text-[12px] space-y-2">
        {genres.map((g, i) => {
          const pct = Math.max(0.08, g.count / max);
          return (
            <li key={g.name} className="flex gap-2 items-center">
              <span style={{ width: 22 }} className="font-bold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="uppercase break-words leading-tight font-bold">
                  {g.name}
                </div>
                <div
                  style={{
                    height: 4,
                    background: 'rgba(26,26,26,0.15)',
                    marginTop: 2,
                  }}
                >
                  <div
                    style={{
                      width: `${pct * 100}%`,
                      height: '100%',
                      background: INK,
                    }}
                  />
                </div>
              </div>
              <span className="font-bold whitespace-nowrap">{g.count}</span>
            </li>
          );
        })}
      </ul>
      <div className="divider-dashed my-4" />
      <div className="text-[12px] space-y-1">
        <div className="flex justify-between">
          <span>TOP GENRE</span>
          <span className="uppercase font-bold">{genres[0]?.name ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span>UNIQUE GENRES</span>
          <span>{genres.length}</span>
        </div>
        <div className="flex justify-between">
          <span>SAMPLED ARTISTS</span>
          <span>{totalArtists}</span>
        </div>
        <div className="divider-dashed my-2" />
        <div className="flex justify-between font-bold text-[14px]">
          <span>TOTAL HITS</span>
          <span>{totalCount}</span>
        </div>
      </div>
    </>
  );
}
