# Real-Time Patient Intake

A responsive patient registration form and a live staff monitoring view, built with
Next.js, TailwindCSS, and Socket.IO. Whatever a patient types into the form on one
device appears on the staff dashboard on another device instantly, with a status
indicator (filling in / submitted / inactive).

## Overview

- **Patient Form** (`/patient`) — patients enter their personal details. The form
  validates required fields, phone and email formats, and shows progress
  (`x/9 required fields completed`) as they go.
- **Staff View** (`/staff`) — lists every active patient session as a card, with a
  live status badge and a detail panel that mirrors the selected patient's form
  field-by-field, in real time.
- **Sync** — every keystroke (debounced 250ms) is pushed over a WebSocket to the
  server, which fans it out to all connected staff clients.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS v4
- **Real-time**: Socket.IO (WebSocket, with polling fallback), via a custom Node
  server (`server.js`) that wraps the Next.js request handler
- **Hosting target**: any Node-capable host (Render, Railway, Heroku, a VM, etc.) —
  see [Deployment](#deployment) for why Vercel's serverless functions don't work
  here

## Getting Started

```bash
npm install
npm run dev
```

Open two browser windows:

- `http://localhost:3000/patient` — fill in the form as a patient
- `http://localhost:3000/staff` — watch the same session update live

For production:

```bash
npm run build
npm start
```

## Environment Variables

None are required to run this app. `server.js` reads three optional variables,
all with safe defaults, and there are no secrets/API keys to configure:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Port the HTTP + WebSocket server listens on (Render sets this automatically) |
| `HOSTNAME` | `0.0.0.0` | Bind address (`0.0.0.0` is required for the server to be reachable on most hosts, including Render) |
| `NODE_ENV` | — | `production` enables the built production build; anything else runs in dev mode |

## Deployment

**Live URL:** https://patient-realtime-intake.onrender.com
(deployed on Render's free tier — the service spins down after 15 minutes of
inactivity and takes ~30–50s to wake back up on the next request)

This app uses a persistent WebSocket connection, which needs a long-lived Node
process — Vercel's serverless functions close after each request and can't hold a
socket open (they also never run `server.js` at all — Vercel deploys Next.js apps
through its own function handler, ignoring custom servers entirely). Deploy
`npm run build` + `npm start` (which runs `server.js`) to a platform that keeps a
process running, e.g. **Render**, **Railway**, **Fly.io**, or a traditional
**Heroku** dyno. Netlify/Vercel work fine for the static parts but would need
their separate WebSocket/Edge-function offerings wired in instead of the
`server.js` used here.

A `render.yaml` blueprint is included so Render can auto-configure the build
and start commands. See [`DEPLOY.md`](./DEPLOY.md) for exact step-by-step
deploy instructions.

## Bonus Features

- Live **progress bar** on the patient form (`x/9 required fields completed`).
- **Connection indicator** on both views showing WebSocket connectivity.
- Staff dashboard **summary counters** (filling in / submitted / inactive counts).
- Sessions **auto-flip to "inactive"** after 15s of no input, so staff can tell a
  patient walked away without submitting — not just "filling" forever.
- Per-field **inline validation** (on blur) in addition to submit-time validation.
- A patient's session survives a page refresh (session id persisted in
  `localStorage`), so accidentally reloading the form doesn't lose their spot on
  the staff dashboard.
- UI styled to match **Agnos's own brand look** (indigo/violet gradients,
  rounded glassy cards, pill-shaped status chips) rather than a generic form.

## Known Limitations

- **No authentication.** `/staff` is not gated behind a login — anyone with the
  URL can view every patient's personal information. The assignment brief
  didn't call for auth, so none was built, but this would need to change
  before handling real patient data. The clean way to add it later: put
  `/staff` behind a session-based login (e.g. `next-auth`) and check it in a
  `middleware.js` before allowing the socket to `staff:join`.
- **In-memory session store.** Patient/session data lives in a `Map` inside
  the running process (`server.js`). It's lost on every restart/redeploy, and
  wouldn't stay consistent if the app ever scaled to multiple instances. Fine
  for this assignment's scope; a real deployment would move it to Redis or a
  database.
- **No server-side rate limiting.** Debouncing on the client keeps normal
  usage light, but nothing stops a modified client from flooding the socket
  with events. Field values are capped in length and validated server-side
  before being trusted as "submitted" (see `server.js`), but there's no
  per-connection rate limit.

## Development Planning Documentation

See [`docs/PLANNING.md`](./docs/PLANNING.md) for project structure, design
decisions, component architecture, and the real-time synchronization flow.

See [`docs/REQUIREMENTS_MAPPING.md`](./docs/REQUIREMENTS_MAPPING.md) for a
requirement-by-requirement mapping back to the original assignment PDF.
