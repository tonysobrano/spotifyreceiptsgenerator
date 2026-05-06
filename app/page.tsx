import { cookies } from 'next/headers';
import Receipt from './components/Receipt';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('spotify_access_token');

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Spotify Receipts</h1>
          <p className="mb-8 text-neutral-300">
            Generate a receipt of your top tracks on Spotify.
          </p>
          <a
            href="/api/login"
            className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-full transition"
          >
            Log in with Spotify
          </a>
        </div>
      </main>
    );
  }

  return <Receipt />;
}
