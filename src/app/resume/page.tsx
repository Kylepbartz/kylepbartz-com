import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume — Kyle Bartz",
};

const experience = [
  {
    role: "Instructional Designer",
    company: "TaskUs",
    period: "Jan 2022 — Present",
    location: "Milwaukee, WI · Remote",
    bullets: [
      "Design and develop training programs for a distributed team.",
    ],
  },
  {
    role: "Instructional Designer II",
    company: "Apple (Contract)",
    period: "Sep 2021 — Jan 2022",
    location: "Austin, TX",
    bullets: [
      "Created trainings for customer support of consumer and professional creative apps, including Pages, Numbers, Keynote, Photos, iMovie, GarageBand, Logic Pro, and Final Cut.",
    ],
  },
  {
    role: "Instructional Designer",
    company: "YouTube (Contract)",
    period: "Jun 2021 — Sep 2021",
    location: "Austin, TX",
    bullets: [
      "Developed training on YouTube features including analytics, copyright, policy enforcement, AdSense, ad revenue, alternative monetization, and merchandising.",
    ],
  },
  {
    role: "Associate Instructional Designer",
    company: "Whole Foods Market",
    period: "Jan 2020 — Dec 2020",
    location: "Austin, TX",
    bullets: [],
  },
  {
    role: "Technology Trainer (Creative)",
    company: "Apple",
    period: "Nov 2016 — Aug 2019",
    location: "Greater Milwaukee",
    bullets: [
      "Guided customers through setup and use of new and existing devices, and mentored internal and external customers.",
      "Led Kids Camp sessions teaching kids to code and create with Apple products.",
      "Delivered live presentations on creative products, apps, and software to large audiences.",
    ],
  },
  {
    role: "Product Sales Specialist",
    company: "Apple",
    period: "Aug 2011 — Nov 2016",
    location: "Greater Milwaukee",
    bullets: [
      "Helped customers find the right hardware and software solutions and led one-to-many device setup sessions.",
    ],
  },
  {
    role: "Assistant Engineer",
    company: "Rax Trax Recording (Internship)",
    period: "Feb 2011 — Aug 2011",
    location: "Greater Chicago Area",
    bullets: [
      "Handled session setup including microphone choice/placement, signal flow, and equipment setup.",
      "Recorded and mixed sessions using Pro Tools and Logic, including vocal compositing and beat matching.",
    ],
  },
];

const education = [
  {
    school: "Full Sail University",
    credential: "B.S., Audio Engineering",
    period: "2008 — 2010",
    detail: "3.8 GPA",
  },
];

const skills = [
  "Instructional Design",
  "Training Development",
  "Articulate Storyline",
  "Articulate Rise",
  "Camtasia",
  "Interactive Media",
  "Logic Pro",
  "Microsoft Office",
  "Google Slides",
  "Google Sheets",
  "Self-Management",
];

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Resume</h1>
          <p className="mt-3 text-foreground/70">
            Instructional designer with a passion for connecting people and
            ideas.
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
              <p className="text-sm text-foreground/50">{job.location}</p>
              {job.bullets.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/50">
          Education
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {education.map((edu) => (
            <div key={edu.school}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="text-lg font-semibold">{edu.school}</h3>
                <span className="text-sm text-foreground/50">
                  {edu.period}
                </span>
              </div>
              <p className="text-sm text-foreground/70">
                {edu.credential} · {edu.detail}
              </p>
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
