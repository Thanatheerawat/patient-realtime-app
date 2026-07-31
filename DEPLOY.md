# Deploying to Render

This app needs a platform that keeps a persistent Node process running (for
the WebSocket connection) — Render's free Web Service tier fits that, and a
`render.yaml` blueprint is already in this repo so Render can configure
itself automatically.

Everything below needs your own GitHub and Render accounts (account creation
isn't something I can do on your behalf) — the actual deploy is ~3 steps once
the code is on GitHub.

## 1. Push this repo to GitHub

```bash
# from the project root — the local commit is already made
gh repo create patient-realtime-app --public --source=. --remote=origin --push
```

If you don't have the `gh` CLI, create an empty repo at github.com/new
(no README/gitignore — this repo already has both), then:

```bash
git remote add origin https://github.com/<your-username>/patient-realtime-app.git
git branch -M main
git push -u origin main
```

## 2. Create a Render account (if you don't have one)

Sign up at [render.com](https://render.com) — the free tier is enough for
this demo. GitHub sign-in is the fastest path since you'll connect the repo
next anyway.

## 3. Deploy

1. In the Render dashboard: **New +** → **Blueprint**.
2. Connect the `patient-realtime-app` GitHub repo you just pushed.
3. Render reads `render.yaml` automatically and proposes a **Web Service**
   named `patient-realtime-intake` with:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Plan: Free
4. Click **Apply** / **Deploy**. First build takes ~2-3 minutes.
5. Once live, Render gives you a URL like
   `https://patient-realtime-intake.onrender.com`. Open
   `<url>/patient` and `<url>/staff` in two tabs to verify the real-time sync
   works in production the same way it did locally.

**Note:** Render's free tier spins the service down after 15 minutes of
inactivity and takes ~30-50s to wake back up on the next request — expected
for a free-tier demo, not a bug.

## After deploying

Update the **Deployed Application** link in [`README.md`](./README.md) with
your live Render URL.
