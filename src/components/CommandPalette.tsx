"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setTheme } from "@/lib/theme";
import { primeKeyClicks, playKeyClick } from "@/lib/keyClicks";

type Line = { type: "input" | "output"; text: string };

const routes: Record<string, string> = {
  "~": "/",
  home: "/",
  "": "/",
  music: "/music",
  video: "/video",
  resume: "/resume",
  cv: "/resume",
};

const NON_CLICK_KEYS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock"]);

const HELP = [
  "available commands:",
  "  help              show this list",
  "  ls                list pages",
  "  cd <page>         go to a page (home, music, video, resume)",
  "  whoami            about me",
  "  contact           contact info",
  "  theme <mode>      light | dark | system",
  "  resume            open the resume page",
  "  clear             clear the screen",
  "  exit              close this terminal",
].join("\n");

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { type: "output", text: 'type "help" to see available commands' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (!open && e.key === "/" && !isTyping) {
        e.preventDefault();
        setOpen(true);
      } else if (open && e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    function onOpenRequest() {
      setOpen(true);
    }
    function onKonami() {
      setOpen(true);
      setLines((prev) => [
        ...prev,
        {
          type: "output",
          text: "cheat code accepted.\nunlocked: nothing, there's no hidden game here.\nbut nice job remembering the konami code.",
        },
      ]);
    }
    window.addEventListener("open-terminal", onOpenRequest);
    window.addEventListener("konami-code", onKonami);
    return () => {
      window.removeEventListener("open-terminal", onOpenRequest);
      window.removeEventListener("konami-code", onKonami);
    };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      primeKeyClicks();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines, open]);

  function print(text: string) {
    setLines((prev) => [...prev, { type: "output", text }]);
  }

  function run(raw: string) {
    const trimmed = raw.trim();
    setLines((prev) => [...prev, { type: "input", text: raw }]);
    if (!trimmed) return;

    const [cmdRaw, ...args] = trimmed.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();

    switch (cmd) {
      case "help":
        print(HELP);
        break;
      case "ls":
        print("home  music  video  resume");
        break;
      case "pwd":
        print(pathname);
        break;
      case "whoami":
        print(
          "kyle_patrick_bartz - instructional designer / audio engineer / video editor"
        );
        break;
      case "contact":
        print(
          "email: kyle@kylepbartz.com\nphone: 414.581.9732\nlinkedin: linkedin.com/in/kyle-bartz-277b8731"
        );
        break;
      case "date":
        print(new Date().toString());
        break;
      case "sudo":
        print("permission denied: nice try.");
        break;
      case "clear":
        setLines([]);
        return;
      case "exit":
        setOpen(false);
        return;
      case "theme": {
        const mode = args[0]?.toLowerCase();
        if (mode === "light" || mode === "dark" || mode === "system") {
          setTheme(mode);
          print(`theme set to ${mode}`);
        } else {
          print("usage: theme <light|dark|system>");
        }
        break;
      }
      case "resume":
        router.push("/resume");
        print("-> /resume");
        break;
      case "cd": {
        const dest = args[0]?.toLowerCase() ?? "";
        if (dest in routes) {
          router.push(routes[dest]);
          print(`-> ${routes[dest]}`);
        } else {
          print(`cd: no such file or directory: ${args[0] ?? ""}`);
        }
        break;
      }
      default:
        if (cmd in routes) {
          router.push(routes[cmd]);
          print(`-> ${routes[cmd]}`);
        } else {
          print(`command not found: ${cmd}`);
        }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-background/80 p-4 pt-[10vh] backdrop-blur-sm sm:p-6"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        className="w-full max-w-xl rounded-sm border border-(--border-color) bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-(--border-color) px-4 py-2 text-[10px] tracking-widest text-foreground/40">
          <span className="flex items-center gap-2">
            <span className="flex gap-1">
              <span className="h-2 w-2 rounded-full border border-(--border-color)" />
              <span className="h-2 w-2 rounded-full border border-(--border-color)" />
              <span className="h-2 w-2 rounded-full border border-(--border-color)" />
            </span>
            <span className="text-syntax-string">terminal.exe</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="transition hover:text-accent"
            aria-label="Close terminal"
          >
            [close]
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-4 py-3 text-sm">
          {lines.map((line, i) => (
            <pre
              key={i}
              className={`whitespace-pre-wrap font-mono ${
                line.type === "input"
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {line.type === "input" ? (
                <>
                  <span className="text-accent">$</span> {line.text}
                </>
              ) : (
                line.text
              )}
            </pre>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex items-center gap-2 border-t border-(--border-color) px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
          }}
        >
          <span className="text-accent">$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (!NON_CLICK_KEYS.has(e.key)) playKeyClick();
            }}
            className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none"
            style={{ caretColor: "var(--accent)" }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command input"
          />
        </form>
      </div>
    </div>
  );
}
