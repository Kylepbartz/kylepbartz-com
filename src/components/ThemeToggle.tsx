"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with the class the inline theme script set on <html> before hydration
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition hover:text-foreground"
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-[18px] w-[18px]"
        >
          <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 15a5 5 0 100-10 5 5 0 000 10zm9-6a1 1 0 010 2h-1a1 1 0 110-2h1zM4 12a1 1 0 010 2H3a1 1 0 110-2h1zm14.36-6.36a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.42-1.41l.71-.71zM6.34 17.66a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.42-1.41l.71-.71zM18.36 17.66l.71.7a1 1 0 01-1.42 1.42l-.7-.71a1 1 0 011.41-1.41zM6.34 6.34l-.71-.7A1 1 0 117.05 4.2l.7.71a1 1 0 01-1.41 1.43zM12 20a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-[18px] w-[18px]"
        >
          <path d="M20.742 13.045a8.088 8.088 0 01-2.077.273c-4.486 0-8.123-3.638-8.123-8.123 0-.72.093-1.418.273-2.077a.75.75 0 00-.976-.933A10.318 10.318 0 002 12.318C2 18.115 6.885 23 12.682 23a10.318 10.318 0 009.985-7.921.75.75 0 00-.925-.923z" />
        </svg>
      )}
    </button>
  );
}
