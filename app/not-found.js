import Link from "next/link";

export const metadata = {
  title: "Page not found | Real-Time Front Desk",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-indigo-100 backdrop-blur">
        <h1 className="text-lg font-semibold text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or the link
          might be incorrect.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
