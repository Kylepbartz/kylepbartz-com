export default function ScanlineOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 opacity-[0.06] dark:opacity-[0.09]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, var(--foreground) 0px, transparent 1px, transparent 2px, var(--foreground) 3px)",
      }}
    />
  );
}
