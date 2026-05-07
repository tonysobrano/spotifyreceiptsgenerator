import { cookies } from 'next/headers';
import Receipt from './components/Receipt';
import Landing from './components/Landing';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('spotify_access_token');

  if (!token) {
    return <Landing />;
  }

  return <Receipt />;
}
