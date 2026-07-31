// Soft blurred gradient blobs behind every page, echoing the purple/blue
// gradient + rounded-card look of the Agnos app. Purely decorative — kept out
// of the tab order and hidden from screen readers.
export default function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl dark:bg-violet-700/20" />
      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-700/20" />
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-900/20" />
    </div>
  );
}
