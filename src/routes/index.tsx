import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Compass,
  Gauge,
  LineChart,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { PublicPage } from "@/components/public-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CAREERS } from "@/data/careers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillBridge — Turn Your Career Aspiration Into a Plan" },
      {
        name: "description",
        content:
          "Discover suitable careers, assess your current skills, see your skill gaps and follow a personalized roadmap toward career readiness.",
      },
      { property: "og:title", content: "SkillBridge — Turn Your Career Aspiration Into a Plan" },
      {
        property: "og:description",
        content:
          "Discover suitable careers, assess your current skills, see your skill gaps and follow a personalized roadmap toward career readiness.",
      },
    ],
  }),
  component: Landing,
});

const PROBLEMS = [
  {
    icon: Compass,
    title: "Career Confusion",
    body: "Many students don't know which career matches their interests and strengths.",
  },
  {
    icon: Search,
    title: "Skill Awareness Gap",
    body: "Students may not know which skills their desired career actually requires.",
  },
  {
    icon: Gauge,
    title: "Self-Assessment Problem",
    body: "It's hard to judge your own skill level against industry expectations.",
  },
  {
    icon: BarChart3,
    title: "Learning Overload",
    body: "Thousands of courses exist, but no personalized order to follow.",
  },
  {
    icon: Target,
    title: "Employability Gap",
    body: "Students rarely know whether they are actually career-ready.",
  },
];

const SOLUTIONS = [
  { icon: Search, title: "Discover", body: "Explore career possibilities." },
  { icon: Gauge, title: "Assess", body: "Understand your current skills." },
  { icon: BarChart3, title: "Analyze", body: "Compare your skills with career requirements." },
  { icon: TrendingUp, title: "Improve", body: "Follow your personalized roadmap." },
  { icon: LineChart, title: "Track", body: "Measure your progress over time." },
];

function Landing() {
  return (
    <PublicPage>
      <section className="hero-mesh relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="chip">
              <Sparkles className="size-3.5" aria-hidden />
              Career clarity for the next generation
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover your career.{" "}
              <span className="text-gradient-brand">Close your skill gaps.</span> Build your future.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SkillBridge helps young people discover suitable career paths, assess their current
              skills, understand what they are missing, and build a personalized roadmap toward
              career readiness.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-[var(--shadow-glow)]">
                <Link to="/register">
                  Start Free Assessment <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/careers">Explore Careers</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                { k: `${CAREERS.length}+`, v: "Career paths" },
                { k: "60+", v: "Tracked skills" },
                { k: "5 min", v: "To your roadmap" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-bold">{s.k}</dt>
                  <dd className="text-sm text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="aurora">
            <PreviewCard />
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">Having a Career Goal Isn't Enough.</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Aspiration is the starting point. Clarity about the distance between where you are and
          what the role expects is what actually moves you forward.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface p-6">
              <Icon className="size-6 text-primary" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">
            One Platform From Aspiration to Career Readiness.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SOLUTIONS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="surface p-6">
                <span className="text-xs font-semibold text-muted-foreground">
                  Step {i + 1}
                </span>
                <Icon className="mt-3 size-6 text-accent" aria-hidden />
                <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Explore career paths</h2>
            <p className="mt-2 text-muted-foreground">
              Every path lists the skills it expects and the level expected for each.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/careers">View all careers</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAREERS.slice(0, 6).map((career) => (
            <Link
              key={career.id}
              to="/careers/$careerId"
              params={{ careerId: career.id }}
              className="surface group p-6 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{career.category}</Badge>
                <span className="text-xs text-muted-foreground">{career.level}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold group-hover:text-primary">
                {career.name}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {career.description}
              </p>
              <p className="mt-4 text-sm font-medium text-primary">
                {career.skills.length} key skills →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-ink text-ink-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Know where you are. Know what to do next.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink-foreground/70">
            Take a free skill assessment and get your readiness estimate, prioritized skill gaps and
            a personalized roadmap.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">Start Free Assessment</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">Try the demo account</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}

function PreviewCard() {
  const gaps = [
    { name: "JavaScript", current: 45, required: 85 },
    { name: "React", current: 20, required: 80 },
    { name: "Node.js", current: 10, required: 75 },
  ];
  return (
    <div className="surface p-6 shadow-[var(--shadow-lift)]" aria-hidden>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Career Goal
          </p>
          <p className="mt-1 font-display text-xl font-bold">Full Stack Developer</p>
        </div>
        <Badge variant="secondary">Example</Badge>
      </div>

      <div className="mt-6 rounded-xl bg-muted/60 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Estimated Career Readiness</p>
          <p className="font-display text-2xl font-bold text-primary">64%</p>
        </div>
        <Progress value={64} className="mt-3" />
      </div>

      <p className="mt-6 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Top skill gaps
      </p>
      <ul className="mt-3 space-y-3">
        {gaps.map((g) => (
          <li key={g.name}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{g.name}</span>
              <span className="text-muted-foreground">
                {g.current}% / {g.required}%
              </span>
            </div>
            <Progress value={g.current} className="mt-1.5 h-1.5" />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4">
        <BrainCircuit className="size-5 text-accent-foreground" aria-hidden />
        <div>
          <p className="text-xs text-muted-foreground">Next step</p>
          <p className="text-sm font-semibold">Strengthen JavaScript fundamentals</p>
        </div>
      </div>
    </div>
  );
}
