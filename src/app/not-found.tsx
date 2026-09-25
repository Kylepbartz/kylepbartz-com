import Link from "next/link";
import TerminalWindow from "@/components/TerminalWindow";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
      <TerminalWindow title="error.log" status="CRASHED" className="w-full">
        <p className="text-xs tracking-widest text-syntax-keyword">
          kernel_panic.exe
        </p>
        <p className="mt-1 text-xs tracking-widest text-red-500">
          SEGMENTATION FAULT
        </p>
        <h1 className="font-display mt-4 text-2xl tracking-widest sm:text-3xl">
          404
        </h1>
        <p className="mt-3 text-sm text-foreground/60">
          <span className="text-syntax-string">&quot;{`page not found`}&quot;</span>{" "}
          is not a recognized process.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block border border-foreground px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
        >
          <span className="text-accent">&gt;</span> RUN home.exe
        </Link>
      </TerminalWindow>
    </div>
  );
}
