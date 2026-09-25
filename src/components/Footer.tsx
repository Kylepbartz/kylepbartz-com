export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-sm text-foreground/60 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Kyle Bartz. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="mailto:kyle@kylepbartz.com" className="hover:text-foreground">
            Email
          </a>
          <a href="tel:+14145819732" className="hover:text-foreground">
            414.581.9732
          </a>
          <a
            href="https://www.linkedin.com/in/kyle-bartz-277b8731"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            LinkedIn
          </a>
          <a
            href="https://soundcloud.com/kyle-bartz-866526878"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            SoundCloud
          </a>
        </div>
      </div>
    </footer>
  );
}
