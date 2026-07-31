import { FIELD_SECTIONS } from "@/lib/fields";
import StatusBadge from "./StatusBadge";

function initials(fields) {
  const first = fields.firstName?.[0] ?? "";
  const last = fields.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

export default function SessionDetail({ session }) {
  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-indigo-200 bg-white/60 p-12 text-center text-slate-500 backdrop-blur dark:border-indigo-500/20 dark:bg-slate-900/40 dark:text-slate-400">
        <p className="text-sm">Select a patient session on the left to view their information.</p>
      </div>
    );
  }

  const { fields, status, sessionId } = session;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-indigo-100 backdrop-blur dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-50 pb-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-sm shadow-indigo-200 dark:shadow-none">
            {initials(fields)}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {[fields.firstName, fields.middleName, fields.lastName].filter(Boolean).join(" ") ||
                "New patient"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Session #{sessionId.slice(0, 8)}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {FIELD_SECTIONS.map((section) => (
        <div key={section.title} className="flex flex-col gap-3">
          <h3 className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            {section.title}
          </h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {section.fields.map((field) => {
              const value = fields[field.name];
              return (
                <div key={field.name} className="rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-white/5">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">{field.label}</dt>
                  <dd
                    className={`text-sm ${
                      value
                        ? "font-medium text-slate-800 dark:text-slate-100"
                        : "italic text-slate-500 dark:text-slate-500"
                    }`}
                  >
                    {value || "Not filled in yet"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}
