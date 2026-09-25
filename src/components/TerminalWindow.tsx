import type { ReactNode } from "react";

export default function TerminalWindow({
  title,
  status = "READY",
  children,
  className = "",
}: {
  title: string;
  status?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-sm border border-(--border-color) transition-colors group-hover:border-accent ${className}`}
    >
      <div className="flex items-center justify-between border-b border-(--border-color) px-4 py-2 text-[10px] tracking-widest text-foreground/40">
        <span className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full border border-(--border-color)" />
            <span className="h-2 w-2 rounded-full border border-(--border-color)" />
            <span className="h-2 w-2 rounded-full border border-(--border-color)" />
          </span>
          {title}
        </span>
        <span className="text-accent">{status}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
