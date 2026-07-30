# Requirements Mapping — Agnos Candidate Assignment (Front-end Developer)

This maps every requirement from `Candidate Assignment Agnos - Front-end developer.pdf`
to where it's implemented in this repo.

## Task

> Develop a responsive, real-time patient input form and staff view system... two
> interfaces should synchronize in real-time... implemented using the specified
> tech stack and deployed on a frontend cloud platform.

- Patient Form → [`app/patient/page.js`](../app/patient/page.js) +
  [`components/PatientForm.js`](../components/PatientForm.js)
- Staff View → [`app/staff/page.js`](../app/staff/page.js) +
  [`components/StaffDashboard.js`](../components/StaffDashboard.js)
- Real-time sync → Socket.IO client (`lib/socket.js`) and server
  (`server.js`); see [`docs/PLANNING.md`](./PLANNING.md#real-time-synchronization-flow)
  for the full event flow.

## Patient Form requirements

| PDF requirement | Where it's implemented |
| --- | --- |
| First Name, Last Name, DOB, Gender, Phone, Email, Address, Preferred Language, Nationality | `lib/fields.js` → `FIELD_SECTIONS` (all marked `required: true`) |
| Middle Name (optional) | `lib/fields.js` — `required: false` |
| Emergency Contact (optional: name + relationship) | `lib/fields.js` — `emergencyContactName`, `emergencyContactRelationship` |
| Religion (optional) | `lib/fields.js` — `required: false` |
| Form validation (required fields, valid phone, valid email) | `lib/validation.js` — `validateField`/`validateForm`, wired into `PatientForm.js` on blur and on submit |
| Responsive design (mobile + desktop) | `components/PatientForm.js` — single column below `sm:`, two-column grid at `sm:` and up; `components/FormField.js` inputs are fluid-width |

## Staff View requirements

| PDF requirement | Where it's implemented |
| --- | --- |
| Display each field in real-time as patient types | `components/SessionDetail.js`, fed by `session:update` socket events in `components/StaffDashboard.js` |
| Responsive design, adapts to screen sizes | `StaffDashboard.js` — session list + detail stack vertically below `lg:`, side-by-side (`320px` + flexible) above `lg:` |
| Indicator: submitted / actively filling / inactive | `components/StatusBadge.js`, driven by `session.status` (`"submitted" \| "filling" \| "inactive"`), set server-side in `server.js` (`patient:join`/`patient:update` → `filling`, `patient:submit` → `submitted`, 15s-no-activity sweep → `inactive`) |

## Real-Time Synchronization

> Use WebSockets or any suitable real-time technology to synchronize data
> between the patient and staff views instantly.

- Implemented with **Socket.IO** (WebSocket transport, polling fallback) over
  a single custom Node server (`server.js`) so the Next.js app and the
  WebSocket endpoint share one origin/port — no separate real-time service
  needed. Every keystroke on the patient form is debounced (250ms) and pushed
  as a `patient:update` event; the server fans it out to all staff clients in
  the `staff-room` immediately. See
  [`docs/PLANNING.md`](./PLANNING.md#real-time-synchronization-flow) for the
  full event sequence.

## Tech Stack

| Required | Used |
| --- | --- |
| Framework: Next.js | Next.js 16 (App Router), `package.json` |
| Styling: TailwindCSS | Tailwind v4, `app/globals.css` + utility classes throughout |
| Real-Time Communication: WebSockets or suitable solution | Socket.IO (`socket.io` / `socket.io-client`) |
| Hosting: Vercel / Heroku / Netlify | See [Deployment note](../README.md#deployment) — this app needs a persistent Node process for WebSockets, so it targets a platform that keeps one running (e.g. Render/Railway), not Vercel's serverless functions, which can't host the custom `server.js` |

## Deliverables

| Required | Where |
| --- | --- |
| Code Repository with setup instructions | This repo + [`README.md`](../README.md#getting-started) |
| Deployed Application | See [Deployment](../README.md#deployment) |
| README with overview, setup, bonus features | [`README.md`](../README.md) |
| Development Planning docs: project structure, design decisions, component architecture, real-time sync flow | [`docs/PLANNING.md`](./PLANNING.md) |

## Evaluation Criteria

- **Responsiveness** — mobile-first layouts on both `/patient` and `/staff`
  (verified at 375px and 1280px viewports during development).
- **Code Quality** — `npm run lint` and `npm run build` both pass clean; shared
  field/validation config (`lib/fields.js`, `lib/validation.js`) avoids
  duplicating the field list between the two views.
- **Functionality** — end-to-end tested manually: filling the patient form in
  one tab updates the staff dashboard in another tab live, status flips
  filling → submitted → (or → inactive after 15s idle), validation blocks
  incomplete/invalid submissions.
- **UX/UI** — visual language (indigo/violet gradients, rounded glassy cards,
  pill status chips) intentionally styled to match Agnos's own app look and
  feel; see [`docs/PLANNING.md`](./PLANNING.md#design-decisions-uiux-across-screen-sizes).
- **Deployment** — see [Deployment](../README.md#deployment).
