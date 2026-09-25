import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TerminalWindow from "@/components/TerminalWindow";

export const metadata: Metadata = {
  title: "Resume - Kyle Bartz",
};

const profile =
  "Passionate, computer-savvy audiophile with over ten years of experience in fast-moving, fluid environments involving both child and adult learning. Skilled in training, self-guided development, troubleshooting, creative problem-solving, public speaking, and connecting on a human level.";

const experience = [
  {
    role: "Instructional Designer",
    company: "TaskUs",
    period: "2022 - Present",
    location: "Austin, TX",
    bullets: [
      "Developed and converted trainings from pre-existing content into interactive, online-based content through Intellum Evolve.",
      "Created custom multimedia content for extensive distribution to a large team.",
      "Created accessibility materials for multimedia presentations, such as subtitles and closed captioning.",
    ],
  },
  {
    role: "Instructional Designer",
    company: "Apple (Contract)",
    period: "2021 - 2022",
    location: "Austin, TX",
    bullets: [
      "Created trainings related to the customer support of consumer and professional creative applications such as Pages, Numbers, Keynote, Photos, iMovie, GarageBand, Logic Pro, and Final Cut.",
    ],
  },
  {
    role: "Instructional Designer",
    company: "Google (Contract)",
    period: "2021",
    location: "Austin, TX",
    bullets: [
      "Developed training in YouTube functions and features such as analytics, copyright, policy enforcement, AdSense, ad revenue, alternative monetization, and merchandising.",
    ],
  },
  {
    role: "Associate Instructional Designer",
    company: "Whole Foods Market",
    period: "2020",
    location: "Austin, TX",
    bullets: [
      "Developed training materials including information system implementation, food safety, order writing, logistics, and store leadership.",
      "Created and edited custom audio and visual content.",
      "Created and distributed training material through eLearning software such as Inkling, Cornerstone, Rise, and Vyond.",
    ],
  },
  {
    role: "Creative",
    company: "Apple",
    period: "2016 - 2019",
    location: "Milwaukee, WI",
    bullets: [
      "Guided customers through the set up and functions of their new and existing devices, and enhanced user productivity.",
      "Mentored both internal and external customers.",
      "Presented creative prowess through various products, apps, and software to large audiences.",
    ],
  },
  {
    role: "Specialist",
    company: "Apple",
    period: "2011 - 2016",
    location: "Milwaukee, WI",
    bullets: [
      "Demonstrated expertise in technical sales by assisting customers in arriving at the complete solution that is right for them, through both hardware and software.",
      "Led customers in learning to use their devices in one-to-many set up interactions.",
    ],
  },
];

const education = [
  {
    school: "Full Sail University",
    location: "Winter Park, FL",
    credential: "Bachelor of Science, Audio Engineering",
    period: "2010",
  },
  {
    school: "Full Sail University",
    location: "Winter Park, FL",
    credential: "Associate of Science, Audio Engineering",
    period: "2009",
  },
];

const skills = [
  "Manufacturer-specific training in troubleshooting and using Apple computers and mobile devices (iOS, macOS)",
  "Pro Tools, Logic, GarageBand, Final Cut, iWork, Adobe Lightroom, Photoshop, iMovie, Swift Playgrounds, Procreate",
  "Vyond and Camtasia for visual learning materials",
  "Curriculum creation in Cornerstone, Evolve, Articulate, and other HTML-based LMS platforms",
  "Organization of high-volume data/project files",
  "Public presentation, demonstration, and feedback for adult learning",
  "Technical troubleshooting and creative problem-solving",
];

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
              href="mailto:kyle@kylepbartz.com"
              className="transition hover:text-accent"
            >
              <span className="text-accent">&gt;</span> kyle@kylepbartz.com
            </a>
            <a
              href="tel:+14145819732"
              className="transition hover:text-accent"
            >
              <span className="text-accent">&gt;</span> 414.581.9732
            </a>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
