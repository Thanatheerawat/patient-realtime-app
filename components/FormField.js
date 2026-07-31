export default function FormField({ field, value, error, onChange, onBlur }) {
  const baseInputClasses =
    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 " +
    "dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 " +
    (error ? "border-red-400 dark:border-red-500/70" : "border-slate-200 dark:border-white/10");
  const errorId = `${field.name}-error`;

  // For fields marked digitsOnly (e.g. phone), strip anything that isn't a
  // digit as the user types instead of just validating after the fact —
  // `type="tel"` alone doesn't restrict input to numbers. Also enforce
  // maxLength here rather than relying solely on the native attribute, which
  // only guards real keystrokes/paste, not every possible way a value can
  // change.
  function handleInputChange(e) {
    const raw = e.target.value;
    let next = field.digitsOnly ? raw.replace(/\D/g, "") : raw;
    if (field.maxLength) next = next.slice(0, field.maxLength);
    onChange(field.name, next);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={field.name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {field.label}
        {field.required && <span className="text-red-500 dark:text-red-400"> *</span>}
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
          onChange={handleInputChange}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseInputClasses}
          placeholder={field.type === "date" ? undefined : field.label}
          max={field.type === "date" ? new Date().toISOString().split("T")[0] : undefined}
          maxLength={field.maxLength}
          inputMode={field.digitsOnly ? "numeric" : undefined}
          pattern={field.digitsOnly ? "[0-9]*" : undefined}
        />
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
