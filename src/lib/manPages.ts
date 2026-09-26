const PAGE_WIDTH = 60;
const CATEGORY = "Kyle Bartz Manual";

function header(cmd: string) {
  const tag = `${cmd.toUpperCase()}(1)`;
  const pad = Math.max(1, PAGE_WIDTH - tag.length * 2 - CATEGORY.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return `${tag}${" ".repeat(left)}${CATEGORY}${" ".repeat(right)}${tag}`;
}

function manPage(cmd: string, summary: string, synopsis: string, description: string[]) {
  return [
    header(cmd),
    "",
    "NAME",
    `       ${cmd} - ${summary}`,
    "",
    "SYNOPSIS",
    `       ${synopsis}`,
    "",
    "DESCRIPTION",
    ...description.map((line) => `       ${line}`),
  ].join("\n");
}

const MAN_PAGES: Record<string, string> = {
  help: manPage("help", "show the list of available commands", "help", [
    "Prints the list of commands this terminal understands, along with",
    "a short usage hint for each.",
  ]),
  ls: manPage("ls", "list pages and files", "ls [dir]", [
    "List the current virtual directory's contents.",
    "",
    "With no arguments, lists site pages, root files, and the",
    "projects/ directory. Pass a directory name (e.g. projects) to",
    "list it without changing into it.",
  ]),
  cat: manPage("cat", "print a file's contents", "cat <file>", [
    "Prints the contents of a virtual file, such as about.txt,",
    "contact.txt, resume.txt, or a file inside projects/.",
  ]),
  cd: manPage("cd", "change the working page or directory", "cd <page|dir|..>", [
    "Navigates to a real page (home, music, video, resume) or moves",
    "into the virtual projects/ directory. Use .. to leave projects/.",
  ]),
  pwd: manPage("pwd", "print working directory", "pwd", [
    "Prints the current route, or the virtual directory path when",
    "inside projects/.",
  ]),
  whoami: manPage("whoami", "print a one-line bio", "whoami", [
    "Prints who is running this terminal.",
  ]),
  contact: manPage("contact", "print contact info", "contact", [
    "Prints an email address, phone number, and LinkedIn profile.",
  ]),
  date: manPage("date", "print the current date and time", "date", [
    "Prints the visitor's local date and time.",
  ]),
  theme: manPage("theme", "set the color theme", "theme <light|dark|system>", [
    "Sets the site's color theme and remembers it for next visit.",
  ]),
  resume: manPage("resume", "open the resume page", "resume", [
    "Navigates to the resume page. Equivalent to cd resume.",
  ]),
  clock: manPage("clock", "toggle a draggable clock widget", "clock [city]", [
    "Opens a floating clock widget showing the local time.",
    "",
    "Pass a city name to look up that city's time zone instead,",
    "e.g. clock tokyo.",
  ]),
  weather: manPage(
    "weather",
    "toggle a draggable weather widget",
    "weather [city]",
    [
      "Opens a floating weather widget for Milwaukee, WI by default.",
      "",
      "Pass a city name to look up conditions there instead,",
      "e.g. weather austin.",
    ]
  ),
  sysinfo: manPage(
    "sysinfo",
    "toggle a draggable system info widget",
    "sysinfo",
    [
      "Opens a floating widget reporting uptime, resolution, browser,",
      "theme, and some entirely fictional hardware specs.",
    ]
  ),
  ps: manPage("ps", "list running widgets", "ps", [
    "Lists the widgets currently open as fake processes.",
    "",
    "See also: kill(1), top(1).",
  ]),
  kill: manPage("kill", "close a running widget", "kill <process>", [
    "Terminates a running widget by name, e.g. kill clock.",
    "",
    "See ps(1) for the list of running processes.",
  ]),
  reboot: manPage("reboot", "reboot the site", "reboot", [
    "Clears the boot flag and reloads the page, dropping you back",
    "into the startup sequence.",
  ]),
  man: manPage("man", "print this manual", "man <command>", [
    "Prints a manual page for a command, if one exists.",
  ]),
  sudo: manPage("sudo", "execute a command as the superuser", "sudo <command>", [
    "Attempts to elevate privileges. This has never once worked.",
  ]),
  clear: manPage("clear", "clear the terminal", "clear", [
    "Clears all previous output from this terminal session.",
  ]),
  exit: manPage("exit", "close the terminal", "exit", [
    "Closes this terminal window.",
  ]),
};

MAN_PAGES.top = manPage("top", "list running widgets", "top", [
  "Alias for ps(1).",
]);

export function getManPage(command: string): string | undefined {
  return MAN_PAGES[command.toLowerCase()];
}
