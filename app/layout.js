import './globals.css';
import { VT323, IBM_Plex_Mono } from 'next/font/google';

const display = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Spotify Receipts Generator',
  description: 'Generate a receipt of your top tracks on Spotify',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="font-mono" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
