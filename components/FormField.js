export default function FormField({ field, value, error, onChange, onBlur }) {
  const baseInputClasses =
    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 " +
    (error ? "border-red-400" : "border-slate-200");
  const errorId = `${field.name}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={field.name} className="text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>

      {field.type === "select" ? (
        <select
          id={field.name}
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseInputClasses}
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={field.name}
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          rows={3}
          className={baseInputClasses}
          placeholder={field.label}
        />
      ) : (
        <input
          id={field.name}
          name={field.name}
          type={field.type}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseInputClasses}
          placeholder={field.type === "date" ? undefined : field.label}
          max={field.type === "date" ? new Date().toISOString().split("T")[0] : undefined}
        />
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
