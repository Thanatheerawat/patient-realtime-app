import StatusBadge from "./StatusBadge";

function timeAgo(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export default function SessionCard({ session, active, onClick }) {
  const { fields, status, lastActivity } = session;
  const displayName =
    [fields.firstName, fields.lastName].filter(Boolean).join(" ") || "New patient";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full flex-col gap-2 rounded-2xl border p-4 text-left shadow-sm backdrop-blur transition hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-400/50 ${
        active
          ? "border-indigo-300 bg-indigo-50/80 shadow-md shadow-indigo-100 dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:shadow-none"
          : "border-white/60 bg-white/80 dark:border-white/10 dark:bg-slate-900/60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{displayName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Session #{session.sessionId.slice(0, 8)}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{fields.phone || fields.email || "No contact info yet"}</span>
        <span>{timeAgo(lastActivity)}</span>
      </div>
    </button>
  );
}
