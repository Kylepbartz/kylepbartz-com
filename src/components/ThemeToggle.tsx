"use client";

import { useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "dark");
  if (theme !== "system") {
    document.documentElement.classList.add(theme);
  }
}

const options: { value: Theme; label: string; icon: ReactNode }[] = [
  {
    value: "light",
    label: "Light",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[15px] w-[15px]"
      >
        <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 15a5 5 0 100-10 5 5 0 000 10zm9-6a1 1 0 010 2h-1a1 1 0 110-2h1zM4 12a1 1 0 010 2H3a1 1 0 110-2h1zm14.36-6.36a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.42-1.41l.71-.71zM6.34 17.66a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.42-1.41l.71-.71zM18.36 17.66l.71.7a1 1 0 01-1.42 1.42l-.7-.71a1 1 0 011.41-1.41zM6.34 6.34l-.71-.7A1 1 0 117.05 4.2l.7.71a1 1 0 01-1.41 1.43zM12 20a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[15px] w-[15px]"
      >
        <path d="M20.742 13.045a8.088 8.088 0 01-2.077.273c-4.486 0-8.123-3.638-8.123-8.123 0-.72.093-1.418.273-2.077a.75.75 0 00-.976-.933A10.318 10.318 0 002 12.318C2 18.115 6.885 23 12.682 23a10.318 10.318 0 009.985-7.921.75.75 0 00-.925-.923z" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "System",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[15px] w-[15px]"
      >
        <path d="M3 4.5A1.5 1.5 0 014.5 3h15A1.5 1.5 0 0121 4.5v10a1.5 1.5 0 01-1.5 1.5h-6v2h3a1 1 0 110 2H7.5a1 1 0 110-2h3v-2h-6A1.5 1.5 0 013 14.5v-10zM5 5v9h14V5H5z" />
      </svg>
    ),
  },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with the theme the inline init script already applied on <html> before hydration
    setTheme(stored === "light" || stored === "dark" ? stored : "system");
  }, []);

  function select(next: Theme) {
    setTheme(next);
    applyTheme(next);
    if (next === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", next);
    }
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-black/10 p-0.5 dark:border-white/10">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => select(option.value)}
          aria-label={`${option.label} theme`}
          aria-pressed={theme === option.value}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
            theme === option.value
              ? "bg-foreground text-background"
              : "text-foreground/50 hover:text-foreground"
          }`}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
