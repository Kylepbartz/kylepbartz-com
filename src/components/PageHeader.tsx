import type { ReactNode } from "react";

export default function PageHeader({
  process,
  title,
  subtitle,
}: {
  process: string;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="animate-fade-up mb-10">
      <p className="font-display text-xs tracking-widest text-foreground/40">
        {process}
      </p>
      <p className="text-xs tracking-widest text-accent">
        RUNNING<span className="animate-blink">_</span>
      </p>
      <h1 className="font-display mt-4 text-2xl tracking-widest sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-xl text-sm text-foreground/60">{subtitle}</p>
      )}
    </div>
  );
}
