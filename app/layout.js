import './globals.css';

export const metadata = {
  title: 'Spotify Receipts Generator',
  description: 'Generate a receipt of your top tracks on Spotify',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-mono">{children}</body>
    </html>
  );
}
