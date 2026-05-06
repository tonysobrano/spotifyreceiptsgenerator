'use client';

import { useEffect, useRef, useState } from 'react';

const TIME_RANGES = [
  { value: 'short_term', label: 'Last Month' },
  { value: 'medium_term', label: 'Last 6 Months' },
  { value: 'long_term', label: 'All Time' },
];

function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function totalDuration(tracks) {
  const ms = tracks.reduce((sum, t) => sum + t.duration_ms, 0);
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function Receipt() {
  const [range, setRange] = useState('short_term');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderNumber] = useState(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );
  const [now] = useState(() => new Date());
  const receiptRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/top-tracks?time_range=${range}&limit=10`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/api/login';
            return;
          }
          throw new Error('Failed to fetch tracks');
        }
        const data = await res.json();
        if (!cancelled) {
          setTracks(data.items || []);
          setLoading(false);
        }
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
  }, [range]);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(receiptRef.current, {
      backgroundColor: '#f5f1e8',
      scale: 2,
    });
    const link = document.createElement('a');
    link.download = `spotify-receipt-${range}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const rangeLabel = TIME_RANGES.find((r) => r.value === range)?.label;

  const dateStr = now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4">
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {TIME_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              range === r.value
                ? 'bg-green-500 text-black'
                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-neutral-400">Loading your receipt…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && tracks.length > 0 && (
        <>
          <div
            ref={receiptRef}
            className="bg-paper text-black w-full max-w-sm p-8 shadow-lg"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold tracking-widest">SPOTIFY RECEIPTS</h1>
              <p className="text-xs mt-2">ORDER #{orderNumber}</p>
              <p className="text-xs">{rangeLabel.toUpperCase()}</p>
              <p className="text-xs mt-1">
                {dateStr} {timeStr}
              </p>
            </div>

            <div className="border-t border-dashed border-black my-3" />

            <div className="flex text-xs font-bold mb-2">
              <span className="w-6">QTY</span>
              <span className="flex-1">ITEM</span>
              <span>AMT</span>
            </div>

            <div className="border-t border-dashed border-black mb-3" />

            <ul className="text-xs space-y-2">
              {tracks.map((t, i) => (
                <li key={t.id ?? i}>
                  <div className="flex">
                    <span className="w-6">{String(i + 1).padStart(2, '0')}.</span>
                    <span className="flex-1 pr-2 break-words uppercase">
                      {t.name}
                    </span>
                    <span>{formatMs(t.duration_ms)}</span>
                  </div>
                  <div className="pl-6 text-[10px] opacity-75 uppercase">
                    {t.artists.map((a) => a.name).join(', ')}
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-dashed border-black my-4" />

            <div className="flex text-xs justify-between">
              <span>ITEM COUNT:</span>
              <span>{tracks.length}</span>
            </div>
            <div className="flex text-sm font-bold justify-between mt-1">
              <span>TOTAL:</span>
              <span>{totalDuration(tracks)}</span>
            </div>

            <div className="border-t border-dashed border-black my-4" />

            <div className="text-center text-xs">
              <p>CARD #: **** **** **** {orderNumber}</p>
              <p className="mt-2">AUTH CODE: {orderNumber}00{Math.floor(Math.random() * 90 + 10)}</p>
              <p className="mt-3">THANK YOU FOR LISTENING</p>
            </div>
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
