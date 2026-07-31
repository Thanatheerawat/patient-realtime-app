// Custom server: hosts the Next.js app and a socket.io endpoint on the same
// HTTP server/port. Needed because real-time patient <-> staff sync uses
// persistent WebSocket connections, which plain `next start` doesn't expose.
const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory session store. One process instance is enough for this
// assignment; a production system would move this to Redis/a DB.
const sessions = new Map();
const INACTIVITY_TIMEOUT_MS = 15_000;
const SWEEP_INTERVAL_MS = 5_000;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // evict abandoned sessions after 2h

// Mirrors the field names in lib/fields.js. Kept as plain data (not a shared
// import) because this file runs as CommonJS under the custom Node server,
// while lib/fields.js is an ES module consumed by the Next.js/React side.
const ALLOWED_FIELD_NAMES = new Set([
  "firstName",
  "middleName",
  "lastName",
  "dob",
  "gender",
  "nationality",
  "religion",
  "phone",
  "email",
  "address",
  "preferredLanguage",
  "emergencyContactName",
  "emergencyContactRelationship",
]);
const REQUIRED_FIELD_NAMES = [
  "firstName",
  "lastName",
  "dob",
  "gender",
  "nationality",
  "phone",
  "email",
  "address",
  "preferredLanguage",
];
const MAX_FIELD_VALUE_LENGTH = 500;

// Defense in depth: a modified/malicious client could send arbitrary keys or
// oversized payloads over the socket even though the real UI never would.
// Drop unknown keys and cap string length before merging into server state.
function sanitizeFields(rawFields) {
  const clean = {};
  if (!rawFields || typeof rawFields !== "object") return clean;
  for (const [key, value] of Object.entries(rawFields)) {
    if (!ALLOWED_FIELD_NAMES.has(key)) continue;
    clean[key] = String(value ?? "").slice(0, MAX_FIELD_VALUE_LENGTH);
  }
  return clean;
}

function hasAllRequiredFields(fields) {
  return REQUIRED_FIELD_NAMES.every((name) => fields[name]?.toString().trim());
}

function createEmptySession(sessionId) {
  return {
    sessionId,
    status: "inactive", // "inactive" | "filling" | "submitted"
    lastActivity: Date.now(),
    fields: {},
  };
}

function getOrCreateSession(sessionId) {
  let session = sessions.get(sessionId);
  if (!session) {
    session = createEmptySession(sessionId);
    sessions.set(sessionId, session);
  }
  return session;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("staff:join", () => {
      socket.join("staff-room");
      socket.emit("sessions:sync", Array.from(sessions.values()));
    });

    socket.on("patient:join", ({ sessionId } = {}) => {
      if (!sessionId) return;
      socket.join(`patient-${sessionId}`);
      socket.data.sessionId = sessionId;

      const session = getOrCreateSession(sessionId);
      if (session.status !== "submitted") session.status = "filling";
      session.lastActivity = Date.now();

      io.to("staff-room").emit("session:update", session);
      socket.emit("session:state", session);
    });

    socket.on("patient:update", ({ sessionId, fields } = {}) => {
      if (!sessionId) return;
      const session = getOrCreateSession(sessionId);
      session.fields = { ...session.fields, ...sanitizeFields(fields) };
      if (session.status !== "submitted") session.status = "filling";
      session.lastActivity = Date.now();

      io.to("staff-room").emit("session:update", session);
    });

    socket.on("patient:submit", ({ sessionId, fields } = {}) => {
      if (!sessionId) return;
      const session = getOrCreateSession(sessionId);
      session.fields = { ...session.fields, ...sanitizeFields(fields) };
      // Trust but verify: only honor "submitted" if the required fields are
      // actually present, so a bypassed client-side validation can't mark
      // incomplete data as submitted and mislead staff.
      session.status = hasAllRequiredFields(session.fields) ? "submitted" : "filling";
      session.lastActivity = Date.now();

      io.to("staff-room").emit("session:update", session);
    });
  });

  // Mark sessions with no recent activity as "inactive" so staff can tell a
  // patient stopped filling in the form without submitting, and evict
  // sessions abandoned long enough ago that they're no longer relevant —
  // otherwise `sessions` would grow forever for the life of the process.
  const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of sessions.entries()) {
      if (session.status === "filling" && now - session.lastActivity > INACTIVITY_TIMEOUT_MS) {
        session.status = "inactive";
        io.to("staff-room").emit("session:update", session);
      }
      if (now - session.lastActivity > SESSION_TTL_MS) {
        sessions.delete(sessionId);
        io.to("staff-room").emit("session:remove", { sessionId });
      }
    }
  }, SWEEP_INTERVAL_MS);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

  // Graceful shutdown so Render/host restarts and redeploys close existing
  // connections cleanly instead of dropping them mid-request.
  function shutdown() {
    clearInterval(sweepInterval);
    io.close();
    httpServer.close(() => process.exit(0));
  }
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
});
