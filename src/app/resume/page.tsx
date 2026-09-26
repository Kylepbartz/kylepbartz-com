import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TerminalWindow from "@/components/TerminalWindow";
import { profile, experience, education, skills } from "@/data/resume";
import { email, phone, phoneHref } from "@/data/contact";

export const metadata: Metadata = {
  title: "Resume - Kyle Bartz",
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader process="cv.exe" title="RESUME" subtitle={profile} />
        <a
          href="/resume.pdf"
          download
          className="mb-10 shrink-0 border border-foreground px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
        >
          <span className="text-accent">&gt;</span> DOWNLOAD resume.pdf
        </a>
      </div>

      <div className="flex flex-col gap-6">
        <TerminalWindow title="experience.log">
          <div className="flex flex-col gap-8">
            {experience.map((job) => (
              <div key={job.role + job.company + job.period}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-display text-xs tracking-widest sm:text-sm">
                    <span className="text-syntax-string">
                      {job.role.toUpperCase()}
                    </span>{" "}
                    <span className="text-foreground/30">·</span>{" "}
                    <span className="text-syntax-keyword">
                      {job.company.toUpperCase()}
                    </span>
                  </h3>
                  <span className="text-xs text-syntax-number">
                    {job.period}
                  </span>
                </div>
                <p className="text-xs text-foreground/40">{job.location}</p>
                {job.bullets.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground/70">
                    {job.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="text-foreground/30">-</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </TerminalWindow>

        <TerminalWindow title="education.log">
          <div className="flex flex-col gap-4">
            {education.map((edu) => (
              <div key={edu.credential}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-display text-xs tracking-widest text-syntax-string sm:text-sm">
                    {edu.school.toUpperCase()}
                  </h3>
                  <span className="text-xs text-syntax-number">
                    {edu.period}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">
                  {edu.credential} · {edu.location}
                </p>
              </div>
            ))}
          </div>
        </TerminalWindow>

        <TerminalWindow title="skills.log">
          <ul className="flex flex-col gap-2 text-sm text-foreground/70">
            {skills.map((skill) => (
              <li key={skill} className="flex gap-2">
                <span className="text-syntax-keyword">&gt;</span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </TerminalWindow>

        <TerminalWindow title="contact.log">
          <div className="flex flex-col gap-1 text-sm text-foreground/70">
            <a
              href={`mailto:${email}`}
              className="transition hover:text-accent"
            >
              <span className="text-accent">&gt;</span> {email}
            </a>
            <a
              href={`tel:${phoneHref}`}
              className="transition hover:text-accent"
            >
              <span className="text-accent">&gt;</span> {phone}
            </a>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
