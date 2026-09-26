"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setTheme } from "@/lib/theme";
import { primeKeyClicks } from "@/lib/keyClicks";
import { rootFiles, projectFiles, projectsDirName } from "@/lib/vfs";
import { email, phone, linkedin } from "@/data/contact";
import { triggerKonami } from "@/components/KonamiCode";
import { OPEN_CLOCK_EVENT } from "@/components/ClockWidget";
import { OPEN_WEATHER_EVENT } from "@/components/WeatherWidget";
import { OPEN_SYSINFO_EVENT } from "@/components/SysInfoWidget";
import {
  listRunningProcesses,
  isProcessRunning,
  type ProcessName,
} from "@/lib/processRegistry";
import { getManPage } from "@/lib/manPages";
import { fetchLeaderboard } from "@/lib/leaderboard";

type Line = { type: "input" | "output"; text: string };

const OPEN_SOUND_SRC = "/audio/terminal-open.wav";
const CLOSE_SOUND_SRC = "/audio/terminal-close.wav";

const routes: Record<string, string> = {
  "~": "/",
  home: "/",
  "": "/",
  music: "/music",
  video: "/video",
  resume: "/resume",
  cv: "/resume",
};

// Each widget toggles via its own event; since `kill` only ever fires this
// when the process is confirmed running (via isProcessRunning), toggling is
// equivalent to closing it.
const PROCESS_EVENTS: Record<ProcessName, () => void> = {
  "clock.exe": () => window.dispatchEvent(new Event(OPEN_CLOCK_EVENT)),
  "weather.exe": () => window.dispatchEvent(new Event(OPEN_WEATHER_EVENT)),
  "sysinfo.exe": () => window.dispatchEvent(new Event(OPEN_SYSINFO_EVENT)),
};

const HELP_BASIC = [
  "available commands:",
  "  help              show this list",
  "  ls                list pages",
  "  cd <page>         go to a page (home, music, video, resume)",
  "  whoami            about me",
  "  contact           contact info",
  "  theme <mode>      light | dark | system",
  "  resume            open the resume page",
  "  reboot            reboot the site back to the startup sequence",
  "  clock [city]      toggle clock widget (optionally for a city)",
  "  weather [city]    toggle weather widget (optionally for a city)",
  "  sysinfo           toggle a draggable sysinfo widget",
  "  andromeda         launch the ANDROMEDA mini-game",
  "  leaderboard       show ANDROMEDA high scores",
  "  clear             clear the screen",
  "  exit              close this terminal",
].join("\n");

const HELP_ADVANCED = [
  "available commands:",
  "  help              show this list",
  "  ls [dir]          list pages and files (try: ls projects)",
  "  cat <file>        print a file's contents (try: cat about.txt)",
  "  cd <page|dir|..>  go to a page or virtual directory",
  "  pwd               print working directory",
  "  whoami            about me",
  "  contact           contact info",
  "  theme <mode>      light | dark | system",
  "  resume            open the resume page",
  "  reboot            reboot the site back to the startup sequence",
  "  clock [city]      toggle clock widget (optionally for a city)",
  "  weather [city]    toggle weather widget (optionally for a city)",
  "  sysinfo           toggle a draggable sysinfo widget",
  "  ps | top          list running widgets",
  "  kill <process>    close a running widget by name",
  "  man <command>     print a command's manual page",
  "  andromeda         launch the ANDROMEDA mini-game",
  "  leaderboard       show ANDROMEDA high scores",
  "  clear             clear the screen",
  "  exit              close this terminal",
].join("\n");

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [cwd, setCwd] = useState<"/" | "/projects">("/");
  const [advanced, setAdvanced] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { type: "output", text: 'type "help" to see available commands' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(false);
  // Command history, like a real shell: chronological order (oldest first).
  // historyStepRef counts how many steps back from the newest entry the
  // input is currently showing; -1 means "not navigating, live typing."
  const historyRef = useRef<string[]>([]);
  const historyStepRef = useRef(-1);
  const draftRef = useRef("");

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
    window.addEventListener("open-terminal", onOpenRequest);
    return () => {
      window.removeEventListener("open-terminal", onOpenRequest);
    };
  }, []);

  useEffect(() => {
    // Runs immediately off the gesture that opened/closed the terminal (a
    // keypress or click), so playback is guaranteed to be allowed.
    if (open) {
      hasOpenedRef.current = true;
      inputRef.current?.focus();
      primeKeyClicks();
      const audio = new Audio(OPEN_SOUND_SRC);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } else if (hasOpenedRef.current) {
      const audio = new Audio(CLOSE_SOUND_SRC);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines, open]);

  function print(text: string) {
    setLines((prev) => [...prev, { type: "output", text }]);
  }

  function toggleAdvanced(next: boolean) {
    setAdvanced(next);
    if (!next) setCwd("/");
  }

  function run(raw: string) {
    const trimmed = raw.trim();
    setLines((prev) => [...prev, { type: "input", text: raw }]);
    if (!trimmed) return;

    const [cmdRaw, ...args] = trimmed.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();

    switch (cmd) {
      case "help":
        print(advanced ? HELP_ADVANCED : HELP_BASIC);
        break;
      case "ls": {
        if (!advanced) {
          print("home  music  video  resume");
          break;
        }
        const dir = args[0]?.toLowerCase().replace(/\/$/, "");
        if (dir === projectsDirName) {
          print(projectFiles.map((f) => f.name).join("  "));
        } else if (!dir && cwd === "/projects") {
          print(projectFiles.map((f) => f.name).join("  "));
        } else if (!dir) {
          print(
            [
              "home",
              "music",
              "video",
              "resume",
              ...rootFiles.map((f) => f.name),
              `${projectsDirName}/`,
            ].join("  ")
          );
        } else {
          print(`ls: cannot access '${args[0]}': No such file or directory`);
        }
        break;
      }
      case "cat": {
        if (!advanced) {
          print(`command not found: ${cmd}`);
          break;
        }
        const arg = args[0];
        if (!arg) {
          print("usage: cat <file>");
          break;
        }
        const [dirPart, filePart] = arg.includes("/")
          ? arg.split("/")
          : [cwd === "/projects" ? projectsDirName : "", arg];
        const files =
          dirPart.toLowerCase() === projectsDirName ? projectFiles : rootFiles;
        const file = files.find(
          (f) => f.name.toLowerCase() === filePart.toLowerCase()
        );
        if (file) {
          print(file.content);
        } else {
          print(`cat: ${arg}: No such file or directory`);
        }
        break;
      }
      case "pwd":
        print(cwd === "/projects" ? "/projects" : pathname);
        break;
      case "whoami":
        print(
          "kyle_patrick_bartz - instructional designer / audio engineer / video editor"
        );
        break;
      case "contact":
        print(`email: ${email}\nphone: ${phone}\nlinkedin: ${linkedin}`);
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
      case "andromeda":
        print("cheat code accepted. good memory.");
        triggerKonami();
        setOpen(false);
        return;
      case "leaderboard":
        print("fetching leaderboard...");
        fetchLeaderboard().then((entries) => {
          if (entries.length === 0) {
            print("no scores yet. be the first: andromeda");
            return;
          }
          print(
            [
              "ANDROMEDA LEADERBOARD",
              ...entries.map(
                (e, i) => `${i + 1}. ${e.initials}  ${e.score}  wave ${e.wave}`
              ),
            ].join("\n")
          );
        });
        break;
      case "clock": {
        const query = args.join(" ").trim();
        if (query) {
          window.dispatchEvent(
            new CustomEvent(OPEN_CLOCK_EVENT, { detail: { query } })
          );
          print(`looking up time for ${query}...`);
        } else {
          window.dispatchEvent(new Event(OPEN_CLOCK_EVENT));
          print("toggled clock widget");
        }
        break;
      }
      case "weather": {
        const query = args.join(" ").trim();
        if (query) {
          window.dispatchEvent(
            new CustomEvent(OPEN_WEATHER_EVENT, { detail: { query } })
          );
          print(`looking up weather for ${query}...`);
        } else {
          window.dispatchEvent(new Event(OPEN_WEATHER_EVENT));
          print("toggled weather widget");
        }
        break;
      }
      case "sysinfo":
        window.dispatchEvent(new Event(OPEN_SYSINFO_EVENT));
        print("toggled sysinfo widget");
        break;
      case "ps":
      case "top": {
        if (!advanced) {
          print(`command not found: ${cmd}`);
          break;
        }
        const procs = listRunningProcesses();
        if (procs.length === 0) {
          print("no widgets running");
        } else {
          print(
            [
              "PID  NAME       STATUS",
              ...procs.map(
                (name, i) =>
                  `${(i + 1).toString().padStart(3, "0")}  ${name.padEnd(9)}  running`
              ),
            ].join("\n")
          );
        }
        break;
      }
      case "kill": {
        if (!advanced) {
          print(`command not found: ${cmd}`);
          break;
        }
        const raw = args[0];
        if (!raw) {
          print("usage: kill <process>");
          break;
        }
        const name = (
          raw.toLowerCase().endsWith(".exe") ? raw : `${raw}.exe`
        ).toLowerCase() as ProcessName;
        if (!isProcessRunning(name)) {
          print(`kill: (${raw}): No such process`);
          break;
        }
        PROCESS_EVENTS[name]();
        print(`${name}: terminated`);
        break;
      }
      case "man": {
        if (!advanced) {
          print(`command not found: ${cmd}`);
          break;
        }
        const target = args[0];
        if (!target) {
          print("What manual page do you want?");
          break;
        }
        const page = getManPage(target);
        print(page ?? `No manual entry for ${target}`);
        break;
      }
      case "reboot":
        print("rebooting...");
        sessionStorage.removeItem("booted");
        sessionStorage.setItem("autoboot", "1");
        setTimeout(() => window.location.reload(), 400);
        break;
      case "cd": {
        const dest = args[0]?.toLowerCase().replace(/\/$/, "") ?? "";
        if (dest in routes) {
          router.push(routes[dest]);
          setCwd("/");
          print(`-> ${routes[dest]}`);
        } else if (advanced && dest === projectsDirName) {
          setCwd("/projects");
          print("-> /projects");
        } else if (advanced && dest === ".." && cwd === "/projects") {
          setCwd("/");
          print("-> /");
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
      className="fixed inset-0 z-[70] flex items-start justify-center bg-background/80 p-4 pt-[6vh] backdrop-blur-sm sm:p-6"
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
          <span className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 transition hover:text-accent">
              <input
                type="checkbox"
                checked={advanced}
                onChange={(e) => toggleAdvanced(e.target.checked)}
                className="h-3 w-3 accent-accent"
              />
              advanced
            </label>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="transition hover:text-accent"
              aria-label="Close terminal"
            >
              [close]
            </button>
          </span>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-4 py-3 text-sm">
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
            const trimmed = value.trim();
            if (trimmed && historyRef.current.at(-1) !== trimmed) {
              historyRef.current.push(trimmed);
            }
            historyStepRef.current = -1;
            run(value);
            setValue("");
          }}
        >
          <span className="text-accent">$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              historyStepRef.current = -1;
              setValue(e.target.value);
            }}
            onKeyDown={(e) => {
              const hist = historyRef.current;
              if (e.key === "ArrowUp") {
                e.preventDefault();
                if (hist.length === 0) return;
                if (historyStepRef.current === -1) draftRef.current = value;
                historyStepRef.current = Math.min(
                  historyStepRef.current + 1,
                  hist.length - 1
                );
                setValue(hist[hist.length - 1 - historyStepRef.current]);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyStepRef.current === -1) return;
                historyStepRef.current -= 1;
                setValue(
                  historyStepRef.current === -1
                    ? draftRef.current
                    : hist[hist.length - 1 - historyStepRef.current]
                );
              }
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
