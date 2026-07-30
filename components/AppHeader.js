import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.5-3-8-6.5-8-10.5A5.5 5.5 0 0112 6a5.5 5.5 0 018 4.5c0 4-3.5 7.5-8 10.5z" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-slate-800">Real-Time Intake</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium text-slate-500">
          <Link
            href="/patient"
            className="rounded-full px-3 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            Patient
          </Link>
          <Link
            href="/staff"
            className="rounded-full px-3 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            Staff
          </Link>
        </nav>
      </div>
    </header>
  );
}
