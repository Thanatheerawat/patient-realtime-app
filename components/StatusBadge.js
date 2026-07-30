const STATUS_STYLES = {
  submitted: {
    label: "Submitted",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  filling: {
    label: "Filling in",
    dot: "bg-amber-500 animate-pulse",
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  inactive: {
    label: "Inactive",
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600 ring-slate-500/20",
  },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
