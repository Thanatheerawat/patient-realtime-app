"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { ALL_FIELDS, EMPTY_FORM, FIELD_SECTIONS, REQUIRED_FIELDS } from "@/lib/fields";
import { validateField, validateForm } from "@/lib/validation";
import FormField from "./FormField";

const SESSION_STORAGE_KEY = "patient-session-id";

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export default function PatientForm() {
  const [sessionId] = useState(getOrCreateSessionId);
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [connected, setConnected] = useState(false);
  // One pending debounce timer per field, keyed by field name — using a
  // single shared timer would let a change to one field cancel another
  // field's still-pending sync whenever they're edited within 250ms of
  // each other (e.g. tabbing quickly between fields).
  const debounceTimersRef = useRef(new Map());

  useEffect(() => {
    if (!sessionId) return;
    const socket = getSocket();

    const handleConnect = () => {
      setConnected(true);
      socket.emit("patient:join", { sessionId });
    };
    const handleDisconnect = () => setConnected(false);

    // The server sends back whatever it already has for this session right
    // after patient:join — restores in-progress answers after a page
    // refresh, and shows the confirmation screen instead of a blank
    // editable form if this session was already submitted.
    const handleSessionState = (session) => {
      if (!session) return;
      if (session.status === "submitted") {
        setSubmitted(true);
      } else if (session.fields && Object.keys(session.fields).length > 0) {
        setValues((prev) => ({ ...prev, ...session.fields }));
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("session:state", handleSessionState);
    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("session:state", handleSessionState);
    };
  }, [sessionId]);

  // Clear any pending debounced updates so they don't fire after unmount.
  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const requiredCount = REQUIRED_FIELDS.length;
  const filledRequiredCount = useMemo(
    () => REQUIRED_FIELDS.filter((name) => values[name]?.toString().trim()).length,
    [values]
  );

  function handleChange(name, value) {
    const next = { ...values, [name]: value };
    setValues(next);
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));

    const timers = debounceTimersRef.current;
    if (timers.has(name)) clearTimeout(timers.get(name));
    timers.set(
      name,
      setTimeout(() => {
        timers.delete(name);
        getSocket().emit("patient:update", { sessionId, fields: { [name]: value } });
      }, 250)
    );
  }

  function handleBlur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values[name]) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { isValid, errors: allErrors } = validateForm(values);
    setErrors(allErrors);
    setTouched(ALL_FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: true }), {}));
    if (!isValid) return;

    getSocket().emit("patient:submit", { sessionId, fields: values });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-emerald-100 bg-white/90 p-8 text-center shadow-xl shadow-emerald-100 backdrop-blur">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-emerald-800">Information submitted</h2>
        <p className="text-sm text-emerald-700">
          Thank you. Your information has been sent to the front desk staff. Please have a seat and
          wait to be called.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Patient Registration</h1>
          <p className="text-sm text-slate-500">Please fill in your information below.</p>
        </div>
        <span
          className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${
            connected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-400"}`} />
          {connected ? "Connected" : "Connecting…"}
        </span>
      </div>

      <div className="sticky top-16 z-10 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm shadow-indigo-100 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Required fields completed</span>
          <span className="font-medium text-indigo-600">
            {filledRequiredCount}/{requiredCount}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${(filledRequiredCount / requiredCount) * 100}%` }}
          />
        </div>
      </div>

      {FIELD_SECTIONS.map((section) => (
        <div
          key={section.title}
          className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-indigo-100/70 backdrop-blur sm:p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                <FormField
                  field={field}
                  value={values[field.name]}
                  error={touched[field.name] ? errors[field.name] : ""}
                  onChange={handleChange}
                  onBlur={() => handleBlur(field.name)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300 transition hover:shadow-xl active:opacity-90 sm:w-auto sm:self-end sm:px-8"
      >
        Submit information
      </button>
    </form>
  );
}
