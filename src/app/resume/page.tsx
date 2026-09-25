import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume — Your Name",
};

const experience = [
  {
    role: "Job Title",
    company: "Company Name",
    period: "20XX — Present",
    bullets: [
      "Describe a key responsibility or achievement.",
      "Describe another key responsibility or achievement.",
    ],
  },
  {
    role: "Previous Job Title",
    company: "Previous Company",
    period: "20XX — 20XX",
    bullets: [
      "Describe a key responsibility or achievement.",
      "Describe another key responsibility or achievement.",
    ],
  },
];

const skills = ["Skill One", "Skill Two", "Skill Three", "Skill Four"];

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Resume</h1>
          <p className="mt-3 text-foreground/70">
            A summary of my experience and skills.
          </p>
        </div>
        <a
          href="/resume.pdf"
          download
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          Download PDF
        </a>
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/50">
          Experience
        </h2>
        <div className="mt-4 flex flex-col gap-8">
          {experience.map((job) => (
            <div key={job.role + job.company}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="text-lg font-semibold">
                  {job.role} · {job.company}
                </h3>
                <span className="text-sm text-foreground/50">
                  {job.period}
                </span>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/50">
          Skills
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-black/10 px-3 py-1 text-sm text-foreground/70 dark:border-white/10"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
