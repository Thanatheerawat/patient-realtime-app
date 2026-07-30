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

    socket.on("patient:join", ({ sessionId }) => {
      if (!sessionId) return;
      socket.join(`patient-${sessionId}`);
      socket.data.sessionId = sessionId;

      const session = getOrCreateSession(sessionId);
      if (session.status !== "submitted") session.status = "filling";
      session.lastActivity = Date.now();

      io.to("staff-room").emit("session:update", session);
      socket.emit("session:state", session);
    });

    socket.on("patient:update", ({ sessionId, fields }) => {
      if (!sessionId) return;
      const session = getOrCreateSession(sessionId);
      session.fields = { ...session.fields, ...fields };
      if (session.status !== "submitted") session.status = "filling";
      session.lastActivity = Date.now();

      io.to("staff-room").emit("session:update", session);
    });

    socket.on("patient:submit", ({ sessionId, fields }) => {
      if (!sessionId) return;
      const session = getOrCreateSession(sessionId);
      session.fields = { ...session.fields, ...fields };
      session.status = "submitted";
      session.lastActivity = Date.now();

      io.to("staff-room").emit("session:update", session);
    });

    socket.on("disconnect", () => {
      // Activity sweep (below) handles marking sessions inactive; nothing
      // to do here since a patient may reconnect (e.g. tab refresh).
    });
  });

  // Mark sessions with no recent activity as "inactive" so staff can tell
  // a patient stopped filling in the form without submitting.
  setInterval(() => {
    const now = Date.now();
    for (const session of sessions.values()) {
      if (session.status === "filling" && now - session.lastActivity > INACTIVITY_TIMEOUT_MS) {
        session.status = "inactive";
        io.to("staff-room").emit("session:update", session);
      }
    }
  }, SWEEP_INTERVAL_MS);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
