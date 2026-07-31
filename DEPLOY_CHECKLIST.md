# Deploy Checklist — Manual Steps Only

Everything on this list requires your own accounts/credentials and can't be
done by an automated assistant. Full context and command reference:
`DEPLOY.md`. Do these in order.

- [ ] **1. Review and commit the audit fixes**
  ```bash
  git add -A
  git status   # review what's staged
  git commit -m "Production readiness audit: fix debounce/sync bugs, add server-side validation, security headers, a11y fixes"
  ```

- [ ] **2. Create a GitHub repository**
  Go to [github.com/new](https://github.com/new), create an empty repo (no
  README/gitignore — this repo already has both) named e.g.
  `patient-realtime-app`.

- [ ] **3. Push commits to GitHub**
  ```bash
  git remote add origin https://github.com/<your-username>/patient-realtime-app.git
  git branch -M main
  git push -u origin main
  ```
  (Or use `gh repo create patient-realtime-app --public --source=. --remote=origin --push` if you have the GitHub CLI installed and logged in.)

- [ ] **4. Create or log in to a Render account**
  Sign up at [render.com](https://render.com) — the free tier is enough.
  GitHub sign-in is the fastest path since you'll connect the repo next.

- [ ] **5. Connect GitHub to Render**
  In the Render dashboard: **New +** → **Blueprint**, then authorize/select
  the `patient-realtime-app` repo you just pushed.

- [ ] **6. Confirm the Blueprint settings**
  Render reads `render.yaml` automatically and should propose:
  - Service type: **Web Service**
  - Build command: `npm install && npm run build`
  - Start command: `npm start`
  - Plan: **Free**
  No environment variables need to be added manually — none are required
  (see `README.md#environment-variables`).

- [ ] **7. Deploy**
  Click **Apply** / **Deploy**. First build takes ~2–3 minutes.

- [ ] **8. Verify the production URL**
  Render gives you a URL like `https://patient-realtime-intake.onrender.com`.
  Open it and confirm the home page loads.

- [ ] **9. Verify WebSocket sync actually works in production**
  Open `<your-url>/patient` and `<your-url>/staff` in two separate tabs (or
  two devices). Type into the patient form and confirm the staff view
  updates live, the status badge flips filling → submitted, and the
  connection indicator shows "Live"/"Connected". This is the one thing that
  silently breaks on the wrong host (e.g. Vercel) — don't skip it.

- [ ] **10. Update the README with your live URL**
  Edit the **Live URL** line in `README.md` under the Deployment section,
  commit, and push.

- [ ] **11. (Optional) Configure a custom domain**
  Only if you want one — Render's **Settings → Custom Domains** for the
  service. Not required for submission.

- [ ] **12. Submit**
  Share the GitHub repo link and the live Render URL as required by your
  submission instructions.

## Why these can't be automated for you

- **GitHub repo creation / push** and **Render account creation** both
  require your own authenticated account — an assistant creating accounts on
  your behalf is explicitly out of bounds, and pushing code to a repo you
  haven't created yet has nothing to push to.
- **Connecting GitHub to Render** and **clicking Deploy** happen inside
  Render's dashboard UI, which requires your logged-in session.
- **Verifying the production URL** needs a human (or your own automation) to
  actually load the live site — an assistant can't fetch a URL that doesn't
  exist yet.
