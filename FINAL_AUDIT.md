# Final Production Readiness Audit

**Scope:** Full repo — architecture, code quality, UI, accessibility, security,
performance, error handling, validation, responsiveness, maintainability,
dead code/deps, git status, documentation, and deployment config.

**Method:** Manual line-by-line review of every source file, static analysis
(grep sweeps for dead code/console logs/TODOs), `npm install`/`lint`/`build`/
`start` run and verified, and live manual testing of every major flow in a
real browser (two tabs: patient + staff) with network/console inspection.

---

## Scores (0–100)

| Category | Score | Notes |
| --- | --- | --- |
| **Overall project health** | **82** | Solid, small, well-documented app; the main drag is the absence of auth on a page showing PII |
| Code quality | 88 | Clean, modular, DRY after this audit's fixes; lint/build pass with zero warnings |
| UI / UX | 85 | Consistent design system, responsive, brand-matched; verified via DOM/text inspection (see [Remaining Risks](#remaining-risks) — no pixel screenshot tool available this session) |
| Security | 65 | Real gaps closed this session (input sanitization, server-side re-validation, security headers), but `/staff` has zero authentication — dominant unresolved risk |
| Performance | 82 | All 4 routes prerender as static content, tiny dependency footprint, debounced sync; not benchmarked with Lighthouse (unavailable in this environment) |
| Maintainability | 88 | Single source of truth for fields/validation, two dedicated planning docs, consistent naming/conventions |
| Production readiness (for this assignment's scope) | 80 | Builds, lints, starts, and deploy config are all verified working; not yet actually deployed (needs your action, see `DEPLOY_CHECKLIST.md`) |
| Production readiness (for real patient data) | ~40 | **Do not** put real PII through this without adding authentication and a persistent (non-in-memory) data store first |

The gap between the last two rows is intentional: this app is genuinely ready
to build/deploy/demo for the assignment, but it is **not** ready to hold real
patients' personal data in an unauthenticated, in-memory system.

---

## Remaining Risks

1. **No authentication on `/staff`.** Anyone with the URL sees every patient's
   name, DOB, phone, email, and address. Out of scope for the original PDF
   (auth wasn't requested), so not built unprompted — but it's the single
   biggest thing standing between this app and real-world use. See
   `README.md#known-limitations` for the recommended approach.
2. **In-memory session store.** All patient data lives in a `Map` inside the
   running Node process (`server.js`). A restart/redeploy wipes it, and it
   wouldn't stay consistent across multiple instances if this ever scaled
   horizontally.
3. **No per-connection rate limiting.** Field length is capped and required
   fields are re-validated server-side (fixed this session), but nothing
   stops a modified client from opening many sockets or firing many events
   per second.
4. **UI not pixel-verified.** This session's browser tooling could render and
   inspect the DOM/text/console/network but could not capture screenshots.
   All visual/responsive verification was done via the accessibility tree,
   computed styles, and text content — not a visual diff. Recommend a quick
   manual look before submission.
5. **npm audit: 12 high-severity findings — investigated, not applied.** All
   are in either (a) the ESLint tooling chain (`brace-expansion` →
   `minimatch` → `eslint-config-next`, dev-only, never shipped to users) or
   (b) Next.js's own internally bundled `postcss`/`sharp` (used only by
   `next/image`, which this app doesn't use — confirmed via grep). Our actual
   Tailwind `postcss` resolves to `8.5.25`, outside the vulnerable range
   (verified with `npm ls postcss`). `npm audit fix --force` would downgrade
   `next` from `16.2.12` to `9.3.3` — deleting the App Router and breaking
   the entire app. Left unapplied; revisit when Next.js/eslint-config-next
   ship updated internal deps upstream.
6. **Graceful shutdown not runtime-verified locally.** `server.js` now
   handles `SIGTERM`/`SIGINT` for clean shutdowns — correct for Render's
   Linux containers, but Windows (this dev machine) doesn't deliver real
   POSIX signals the way Linux does, so the handler could be code-reviewed
   but not locally fired-and-observed.
7. **2-hour session eviction not live-tested end-to-end** (would require
   waiting 2 real hours). Logic verified by code review; the same sweep
   interval's 15s inactivity-flip half was exercised repeatedly and works.

---

## Issues Found and Fixed

### Correctness bugs (found via manual testing)

1. **Debounce timer was shared across all fields, not per-field**
   (`components/PatientForm.js`). Editing two fields within the same 250ms
   window cancelled the first field's pending sync — only the last-touched
   field ever reached the server. Reproduced live (bulk-filled 5 fields
   programmatically; only 2 arrived at the staff view), fixed by switching to
   a `Map` of per-field timers, and re-verified live (all 5 fields arrived).
   **Why it mattered:** this could plausibly happen with normal fast
   tabbing/typing, not just the synthetic test — a real risk of silently
   dropped patient data.
2. **Refreshing the patient form always showed a blank form**, discarding
   already-synced progress even though the server still had it — and a
   patient who'd already submitted would see the full editable form again
   instead of the confirmation screen. The server already emitted a
   `session:state` event with exactly the needed data (right after
   `patient:join`); the client never listened for it. Added the listener;
   verified live (refreshed mid-fill → form repopulated; refreshed after
   submit → confirmation screen shown, not the form).
3. **Debounce timers weren't cleared on unmount** — a pending timer could
   fire a stray socket emit after the component was gone. Added cleanup.

### Security hardening (`server.js`)

4. **No server-side validation.** A modified/bypassed client could call
   `patient:submit` with missing required fields and the server would still
   mark the session "submitted," misleading staff. Added
   `hasAllRequiredFields()` — the server now only honors "submitted" if the
   required fields are actually present.
5. **No input sanitization.** A modified client could send arbitrary field
   keys or unbounded string lengths. Added `sanitizeFields()` — drops any key
   outside the known field list and caps values at 500 characters.
6. **Unbounded memory growth.** Sessions were never removed from the
   in-memory `Map`, so a long-running deploy would accumulate abandoned
   sessions forever. Added a 2-hour eviction sweep that deletes stale
   sessions and notifies staff clients (`session:remove`) so they disappear
   from the UI too (client-side handler added in `StaffDashboard.js`).
7. **Missing security headers / framework fingerprinting.** Added
   `poweredByHeader: false` and `X-Content-Type-Options`, `X-Frame-Options`,
   `Referrer-Policy` headers in `next.config.mjs` — verified live via `curl`
   against a production build.
8. **No graceful shutdown.** Added `SIGTERM`/`SIGINT` handling so Render
   redeploys/restarts close connections cleanly instead of dropping them
   mid-request.

### Accessibility (WCAG-oriented)

9. **Form errors weren't associated with their inputs for screen readers.**
   Added `aria-invalid` and `aria-describedby` linking each input to its
   error message (`components/FormField.js`).
10. **Color contrast failures.** `text-slate-400` (~2.9:1 on white) and
    `text-slate-300` (~1.5:1) were used for real content (labels, session
    IDs, empty-state text) — both fail WCAG AA's 4.5:1 minimum for normal
    text. Bumped to `text-slate-500` (~4.6:1, passes) across
    `StaffDashboard.js`, `SessionCard.js`, `SessionDetail.js` (11 instances).
11. **Pulsing status animation ignored `prefers-reduced-motion`.** Changed to
    `motion-safe:animate-pulse`.
12. **Real-time status changes weren't announced to screen readers.** Added
    `role="status" aria-live="polite"` to the connection indicator and stat
    counters — scoped narrowly (not the full session list, which updates on
    every keystroke and would spam screen readers if made live).
13. **Session card had no explicit button type and no selected-state
    semantics.** Added `type="button"` and `aria-pressed={active}`.

### Code quality / dead code

14. **Unused exported function** `fieldLabel()` in `lib/fields.js` — never
    imported anywhere. Removed.
15. **Duplicated required-field logic.** `PatientForm.js` re-derived the
    required field list via `FIELD_SECTIONS.flatMap(...).filter(...)` in two
    places instead of using the already-exported `REQUIRED_FIELDS`/
    `ALL_FIELDS` from `lib/fields.js`. Refactored to use the shared exports.
16. **5 unused scaffold assets** (`public/file.svg`, `globe.svg`, `next.svg`,
    `vercel.svg`, `window.svg`) — leftover from `create-next-app`, confirmed
    via grep that nothing references them. Deleted.
17. **Native browser validation UI could show alongside custom messages.**
    Added `noValidate` to the patient form so only the app's own validation
    messages appear.

### Missing production essentials

18. **No error boundary or custom 404.** Added `app/error.js` and
    `app/not-found.js`, styled consistently with the rest of the app.
    Verified `/not-found` renders correctly live; `error.js` verified via
    lint/build (not deliberately crashed live, to avoid destabilizing the
    running dev server mid-audit).
19. **Home page had no distinct page title** — it silently inherited the
    patient page's `<title>` from the root layout default. Added its own
    metadata, gave the root layout a more sensible generic fallback title,
    and added a title to `not-found.js`. Verified via browser tab title
    before/after.

### Documentation

20. Added an explicit **Environment Variables** section to `README.md` (none
    required; `PORT`/`HOSTNAME`/`NODE_ENV` all have safe defaults) —
    previously undocumented.
21. Added a **Known Limitations** section to `README.md` (no auth, in-memory
    store, no rate limiting) for transparency.
22. Updated `docs/PLANNING.md` to reflect the fixes above.

---

## Issues Found and Intentionally Left Unchanged

| Issue | Why it was left alone |
| --- | --- |
| No authentication on `/staff` | Out of scope of the original assignment PDF; building a full auth system wasn't requested and would be significant unprompted scope creep. Documented instead as the top risk. |
| In-memory-only session store | Appropriate for this assignment's single-instance scope; a real deployment would need Redis/a DB, which is a genuine architecture decision, not a "safe automatic fix." |
| `npm audit`'s 12 high-severity findings | Investigated in depth (see [Remaining Risks](#remaining-risks) #5) — not exploitable in this app's actual usage, and the suggested automated fix would break the app by downgrading Next.js 7 major versions. |
| No dedicated rate limiter | Mitigated indirectly (field-length caps, server-side required-field checks), but adding a real rate limiter is a dependency/infrastructure decision beyond a contained, safe fix. |
| No TypeScript | This project is intentionally plain JavaScript — a reasonable scope choice for an assignment of this size; noted here since the audit brief asked about "no TypeScript/ESLint warnings" specifically. No TS files exist, so there's nothing to type-check; ESLint is clean. |
| No automated accessibility/contrast scanner run | No such tool (e.g. axe-core, Lighthouse) was available in this environment; contrast issues that were caught were found and fixed by manual calculation, not an exhaustive automated pass. |
