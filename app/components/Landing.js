'use client';

const PAPER = '#f5f1e8';
const INK = '#1a1a1a';

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

function MiniBars() {
  const bars = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 1, 2, 3, 1, 2];
  return (
    <div className="flex items-end justify-center gap-px h-6">
      {bars.map((w, i) => (
        <div key={i} style={{ display: 'flex' }}>
          <div style={{ width: w, height: 24, background: INK }} />
          <div style={{ width: 1, height: 24 }} />
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(29,185,84,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(29,185,84,0.18), transparent 55%)',
        }}
      />

      <div className="relative w-full max-w-md">
        <ZigZag />
        <div
          className="receipt-paper receipt-ink font-mono text-ink"
          style={{ padding: '28px 28px 24px' }}
        >
          <div className="text-center">
            <h1
              className="font-display tracking-widest leading-none"
              style={{ fontSize: '54px' }}
            >
              SPOTIFY
            </h1>
            <h2
              className="font-display tracking-widest leading-none"
              style={{ fontSize: '38px', marginTop: '-4px' }}
            >
              RECEIPTS
            </h2>
            <p className="text-[10px] mt-2 tracking-widest opacity-80">
              EST. 2026 · NOW SERVING
            </p>
          </div>

          <div className="divider-dashed my-4" />

          <p className="text-[12px] leading-relaxed text-center">
            Print a receipt of your most-played
            <br />
            <span className="font-bold">tracks</span>,{' '}
            <span className="font-bold">artists</span>, and{' '}
            <span className="font-bold">genres</span>.
            <br />
            Export. Frame. Brag.
          </p>

          <div className="divider-dashed my-4" />

          <ul className="text-[11px] space-y-1">
            <li className="flex justify-between">
              <span>01. TOP TRACKS</span>
              <span className="font-bold">★★★★★</span>
            </li>
            <li className="flex justify-between">
              <span>02. TOP ARTISTS</span>
              <span className="font-bold">★★★★★</span>
            </li>
            <li className="flex justify-between">
              <span>03. TOP GENRES</span>
              <span className="font-bold">★★★★★</span>
            </li>
            <li className="flex justify-between">
              <span>04. PNG EXPORT</span>
              <span className="font-bold">FREE</span>
            </li>
          </ul>

          <div className="divider-dashed my-4" />

          <div className="flex justify-between text-[12px] font-bold">
            <span>TOTAL</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between text-[10px] opacity-70 mt-1">
            <span>PAYMENT</span>
            <span>SPOTIFY OAUTH</span>
          </div>

          <div className="divider-dashed my-4" />

          <a
            href="/api/login"
            className="block text-center bg-[#1db954] text-black font-bold py-3 rounded-full hover:bg-[#1ed760] transition no-underline"
            style={{ letterSpacing: '1px' }}
          >
            ▶ LOG IN WITH SPOTIFY
          </a>

          <p className="text-center text-[9px] mt-3 opacity-70 leading-snug">
            Read-only access. Scopes: user-top-read, user-read-private.
            <br />
            No data stored. Token in httpOnly cookie.
          </p>

          <div className="divider-dashed my-4" />

          <MiniBars />

          <p className="text-center text-[10px] mt-3 tracking-widest font-bold">
            THANK YOU FOR LISTENING
          </p>
          <p className="text-center text-[10px] mt-1 opacity-70">
            ♪ ♫ ♪ ♫ ♪ ♫ ♪
          </p>
        </div>
        <ZigZag flip />
      </div>

      <p className="relative mt-6 text-[11px] text-neutral-400 tracking-widest uppercase">
        Not affiliated with Spotify AB
      </p>
    </main>
  );
}
