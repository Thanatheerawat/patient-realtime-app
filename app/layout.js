import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import BackgroundDecor from "@/components/BackgroundDecor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Real-Time Patient Intake",
  description: "Responsive real-time patient intake form and staff monitoring view.",
};

// Applies the saved theme before first paint so switching pages/reloading
// never flashes the wrong theme. Runs as a plain inline script (not a React
// effect) specifically so it executes ahead of hydration.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-indigo-50 text-slate-900 dark:bg-indigo-950 dark:text-slate-100">
        <BackgroundDecor />
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
