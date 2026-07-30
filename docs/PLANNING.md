# Development Planning

## Project Structure

```
├── server.js                  # Custom Node server: Next.js request handler + Socket.IO
├── app/
│   ├── layout.js               # Root layout, fonts, global background
│   ├── page.js                 # Landing page (links to /patient and /staff)
│   ├── patient/page.js         # Patient route — renders <PatientForm />
│   └── staff/page.js           # Staff route — renders <StaffDashboard />
├── components/
│   ├── AppHeader.js            # Shared top nav (logo + Patient/Staff links)
│   ├── BackgroundDecor.js      # Decorative blurred gradient blobs (brand look)
│   ├── PatientForm.js          # Patient-facing form: state, validation, socket emits
│   ├── FormField.js            # Generic input/select/textarea field with label + error
│   ├── StaffDashboard.js       # Staff-facing session list + selected session detail
│   ├── SessionCard.js          # One row in the staff session list
│   ├── SessionDetail.js        # Full read-only view of one patient's fields
│   └── StatusBadge.js          # Colored pill for filling / submitted / inactive
├── lib/
│   ├── fields.js                # Single source of truth for form fields/sections
│   ├── validation.js            # Per-field and whole-form validation rules
│   └── socket.js                 # Shared client-side socket.io connection
└── docs/PLANNING.md            # This file
```

Field definitions (`lib/fields.js`) are the single source of truth: both the
patient form and the staff detail view iterate over the same `FIELD_SECTIONS`
array, so adding/removing a field only requires editing one file.

## Design Decisions (UI/UX across screen sizes)

- **Visual language matches the Agnos brand**: indigo/violet gradient accents,
  soft blurred gradient blobs in the background, large `rounded-2xl`/`rounded-3xl`
  glassy white cards (`bg-white/80` + `backdrop-blur`), and pill-shaped status
  chips — the same rounded, friendly, purple-leaning health-app look as the
  Agnos symptom-checker app, applied to a desktop/mobile web layout instead of
  native app screens. A shared `AppHeader` (logo mark + Patient/Staff nav) and
  `BackgroundDecor` (the blurred blobs) live in the root layout so every route
  shares one consistent shell.
- **Mobile-first forms**: fields stack in a single column below the `sm`
  breakpoint and become a two-column grid at `sm:` and up, so the patient form is
  comfortable to fill on a phone (the primary device patients are expected to use
  in a waiting room) but doesn't feel sparse on a tablet/desktop kiosk.
- **Sticky progress indicator**: the "x/9 required fields completed" bar stays
  pinned near the top while filling in the form, giving patients constant
  feedback without pushing content around.
- **Staff dashboard as list + detail**: on large screens the session list (left,
  fixed width) and the detail panel (right, flexible) sit side by side
  (`lg:grid-cols-[320px_1fr]`); below `lg` they stack vertically since there
  usually isn't room for two panels side by side on a tablet held at the desk.
- **Color-coded status**: amber/pulsing = filling in, green = submitted, gray =
  inactive — chosen so staff can triage at a glance from across the room, not
  just by reading text.
- **Empty vs. filled distinction**: unfilled fields in the staff detail view are
  shown in italic gray ("Not filled in yet") rather than left blank, so staff
  can tell "not answered" from "value is literally empty string".

## Component Architecture

- **`PatientForm`** (client) — owns all form state (`values`, `errors`,
  `touched`, `submitted`), the session id, and the socket connection lifecycle.
  On every change it updates local state immediately (so typing feels
  instant/uncontrolled-input-free) and emits a debounced `patient:update` event.
  On submit it runs full validation and, if valid, emits `patient:submit` and
  swaps to a confirmation view.
- **`FormField`** (presentational) — renders the correct input type
  (text/date/tel/email/select/textarea) for a field definition and shows a
  validation error underneath. Has no knowledge of sockets or form-wide state.
- **`StaffDashboard`** (client) — owns the `sessions` map (keyed by
  `sessionId`), the socket connection, and which session is currently selected.
  Renders a `SessionCard` per session plus one `SessionDetail` for the selection.
- **`SessionCard` / `SessionDetail` / `StatusBadge`** (presentational) — pure
  rendering components driven entirely by props, so they're trivial to reason
  about and test independently of the socket logic.

## Real-Time Synchronization Flow

1. **Transport**: `server.js` creates a plain Node `http` server, hands
   HTTP requests to Next.js's request handler, and attaches a `socket.io`
   server to the same port — so the app and the WebSocket endpoint share one
   origin and one deploy target.
2. **Session identity**: on first load, the patient form generates a
   `crypto.randomUUID()` and persists it in `localStorage`. This is the
   `sessionId` used for every socket event, and it survives a page refresh so a
   patient doesn't lose their place if their browser reloads.
3. **Patient → server**: `patient:join` on connect (registers the session and
   marks it `filling`), `patient:update` on every debounced keystroke (merges
   changed fields), `patient:submit` on submit (merges fields, status →
   `submitted`).
4. **Server state**: the server keeps an in-memory `Map<sessionId, session>`
   (fields + status + lastActivity). This is intentionally simple for the scope
   of this assignment; a production version would move it to Redis so state
   survives a server restart and works across multiple server instances.
5. **Server → staff**: every patient event triggers `io.to("staff-room").emit
   ("session:update", session)`. Staff clients join `staff-room` on connect and
   also receive a `sessions:sync` snapshot of all sessions at connect time (so a
   staff member opening the dashboard mid-conversation still sees existing
   sessions, not just new ones).
6. **Inactivity detection**: a 5-second server-side interval flips any session
   that's been `filling` for more than 15s without an update to `inactive`, and
   broadcasts that change — this is what powers the "actively filling / inactive"
   distinction the staff view needs, since a plain "last event received" model
   can't distinguish "still typing" from "walked away".
