import Link from "next/link";

export const metadata = {
  title: "Real-Time Patient Intake | Front Desk",
};

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.5-3-8-6.5-8-10.5A5.5 5.5 0 0112 6a5.5 5.5 0 018 4.5c0 4-3.5 7.5-8 10.5z" />
            </svg>
          </span>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Real-Time Patient Intake
          </h1>
          <p className="max-w-md text-sm text-slate-500 sm:text-base">
            Patients fill in their details on one screen while front desk staff watch it arrive on
            the other — live, no refresh needed.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/patient"
            className="group flex flex-col items-start gap-2 rounded-3xl border border-white/60 bg-white/80 p-6 text-left shadow-lg shadow-indigo-100 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              Patient
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Fill in my information</h2>
            <p className="text-sm text-slate-500">
              Open the registration form and enter your personal details.
            </p>
            <span className="mt-2 text-sm font-medium text-indigo-600 group-hover:underline">
              Go to patient form →
            </span>
          </Link>

          <Link
            href="/staff"
            className="group flex flex-col items-start gap-2 rounded-3xl border border-white/60 bg-white/80 p-6 text-left shadow-lg shadow-indigo-100 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
              Staff
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Monitor patients</h2>
            <p className="text-sm text-slate-500">
              Watch patient information arrive in real time as it&apos;s entered.
            </p>
            <span className="mt-2 text-sm font-medium text-indigo-600 group-hover:underline">
              Go to staff view →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
