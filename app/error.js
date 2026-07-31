"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border border-red-100 bg-white/90 p-8 text-center shadow-xl shadow-red-100 backdrop-blur dark:border-red-500/20 dark:bg-slate-900/70 dark:shadow-none">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Something went wrong</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred. You can try again, or head back to the home page.
        </p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md dark:shadow-none"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
