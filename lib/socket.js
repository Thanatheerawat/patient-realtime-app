"use client";

import { io } from "socket.io-client";

let socket;

// Returns a single shared socket.io connection for the browser tab. The
// custom server (server.js) hosts both the Next.js app and the socket.io
// endpoint on the same origin/port, so no URL is needed here.
export function getSocket() {
  if (!socket) {
    socket = io({ autoConnect: true, transports: ["websocket", "polling"] });
  }
  return socket;
}
