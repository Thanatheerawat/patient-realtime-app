"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocket } from "@/lib/socket";
import SessionCard from "./SessionCard";
import SessionDetail from "./SessionDetail";

export default function StaffDashboard() {
  const [sessions, setSessions] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setConnected(true);
      socket.emit("staff:join");
    };
    const handleDisconnect = () => setConnected(false);

    const handleSync = (list) => {
      setSessions(Object.fromEntries(list.map((s) => [s.sessionId, s])));
    };

    const handleUpdate = (session) => {
      setSessions((prev) => ({ ...prev, [session.sessionId]: session }));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("sessions:sync", handleSync);
    socket.on("session:update", handleUpdate);
    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("sessions:sync", handleSync);
      socket.off("session:update", handleUpdate);
    };
  }, []);

  // Re-render periodically so "time ago" labels and inactivity stay fresh.
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const sessionList = useMemo(
    () => Object.values(sessions).sort((a, b) => b.lastActivity - a.lastActivity),
    [sessions]
  );

  const selectedSession = selectedId ? sessions[selectedId] : sessionList[0];

  const counts = useMemo(() => {
    return sessionList.reduce(
      (acc, s) => {
        acc[s.status] = (acc[s.status] ?? 0) + 1;
        return acc;
      },
      { filling: 0, submitted: 0, inactive: 0 }
    );
  }, [sessionList]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Staff View</h1>
          <p className="text-sm text-slate-500">
            Live status of patients currently filling in the registration form.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            connected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-400"}`} />
          {connected ? "Live" : "Connecting…"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        <div className="rounded-2xl border border-white/60 bg-white/80 p-3 text-center shadow-sm shadow-indigo-100 backdrop-blur">
          <p className="text-lg font-semibold text-amber-600">{counts.filling}</p>
          <p className="text-xs text-slate-400">Filling in</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/80 p-3 text-center shadow-sm shadow-indigo-100 backdrop-blur">
          <p className="text-lg font-semibold text-emerald-600">{counts.submitted}</p>
          <p className="text-xs text-slate-400">Submitted</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/80 p-3 text-center shadow-sm shadow-indigo-100 backdrop-blur">
          <p className="text-lg font-semibold text-slate-500">{counts.inactive}</p>
          <p className="text-xs text-slate-400">Inactive</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3">
          {sessionList.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-indigo-200 bg-white/60 p-8 text-center text-sm text-slate-400 backdrop-blur">
              No patients yet. Once someone opens the patient form, they’ll show up here.
            </div>
          ) : (
            sessionList.map((session) => (
              <SessionCard
                key={session.sessionId}
                session={session}
                active={session.sessionId === selectedSession?.sessionId}
                onClick={() => setSelectedId(session.sessionId)}
              />
            ))
          )}
        </div>

        <SessionDetail session={selectedSession} />
      </div>
    </div>
  );
}
