"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border border-red-100 bg-white/90 p-8 text-center shadow-xl shadow-red-100 backdrop-blur">
        <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-500">
          An unexpected error occurred. You can try again, or head back to the home page.
        </p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
