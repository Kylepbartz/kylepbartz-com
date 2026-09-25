export type Theme = "light" | "dark" | "system";

export function setTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "dark");
  if (theme !== "system") {
    document.documentElement.classList.add(theme);
  }
  if (theme === "system") {
    localStorage.removeItem("theme");
  } else {
    localStorage.setItem("theme", theme);
  }
}
