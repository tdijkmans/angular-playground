# Location Tracker POC

A real-time device location tracking proof-of-concept using **WebSockets** and **Mapbox GL JS**, built with Angular 20.

## How it works

1. Each browser tab generates a unique device ID (stored in `localStorage`).
2. The device watches its GPS position via the browser Geolocation API.
3. Location updates are sent over a WebSocket to the server.
4. The server broadcasts every update to **all** connected clients.
5. Each client renders all devices as coloured markers on an interactive Mapbox map.

```
Browser A ──ws──► Server ──ws──► Browser A (own marker, red)
                         └──ws──► Browser B (other markers, blue)
```

## Setup

### 1. Mapbox Access Token

Replace `YOUR_MAPBOX_TOKEN_HERE` in:

```
angular-sandbox/src/environments/environment.ts        ← development
angular-sandbox/src/environments/environment.prod.ts   ← production
```

Get a free token at <https://account.mapbox.com/access-tokens/>.

### 2. Start the WebSocket server

```bash
cd server
npm install
npm start          # runs on ws://localhost:8080
```

### 3. Start the Angular dev server

```bash
cd angular-sandbox
npm install
npx ng serve       # runs on http://localhost:4200
```

Open `http://localhost:4200` in multiple browser tabs (or share with colleagues on the same network), enter a name, and click **▶ Start Sharing**.

## Production deployment

- Deploy the WebSocket server to any Node.js host (Fly.io, Render, Railway, etc.).
- Update `wsUrl` in `environment.prod.ts` to point to your production WebSocket URL (`wss://…`).
- Build the Angular app: `npx ng build` and serve from any static host (Netlify, Vercel, etc.).
