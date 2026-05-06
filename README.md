# Spotify Receipts Generator

A Next.js app that turns your Spotify top tracks into a printable-style receipt, exportable as a PNG.

## Features

- Spotify OAuth (Authorization Code Flow), tokens stored in httpOnly cookies
- Fetches your top tracks via the Spotify Web API
- Toggle time range: Last Month / Last 6 Months / All Time
- Receipt-style UI (monospace, off-white paper)
- Export as PNG with `html2canvas`

## Setup

1. Create a Spotify app at <https://developer.spotify.com/dashboard>.
2. Add `http://localhost:3000/api/callback` as a Redirect URI.
3. Copy `.env.example` to `.env.local` and fill in:

   ```
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/callback
   ```

4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

5. Open <http://localhost:3000>.

## Project structure

```
app/
  api/
    login/route.js       Redirects to Spotify auth URL
    callback/route.js    Exchanges code for access token, sets cookie
    top-tracks/route.js  Proxies request to Spotify with bearer token
    logout/route.js      Clears the access-token cookie
  components/
    Receipt.js           Client component: receipt UI + PNG export
  globals.css
  layout.js
  page.js                Login screen or receipt
```
