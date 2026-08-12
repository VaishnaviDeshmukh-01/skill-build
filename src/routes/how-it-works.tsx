import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, PublicPage } from "@/components/public-page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How SkillBridge Works — From Aspiration to Roadmap" },
      {
        name: "description",
        content:
          "Eight steps: discover a career, set a goal, assess skills, analyse gaps, get a readiness estimate, generate a roadmap, track progress and ask the AI advisor.",
      },
      { property: "og:title", content: "How SkillBridge Works" },
      {
        property: "og:description",
        content: "The full SkillBridge journey from career discovery to a tracked learning plan.",
      },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    title: "Discover a career",
    body: "Browse career paths or answer a short discovery questionnaire that estimates which paths fit your interests and strengths.",
  },
  {
    title: "Set your career goal",
    body: "Pick a target role. Everything after this is measured against that role's configured skill profile.",
  },
  {
    title: "Assess your skills",
    body: "Rate your comfort with each required technical and soft skill. Optional knowledge questions add an objective signal.",
  },
  {
    title: "Analyze skill gaps",
    body: "For every skill we compute required level minus your level, then classify the gap as Strong, Moderate, High or Critical.",
  },
  {
    title: "Get a readiness estimate",
    body: "A weighted coverage score shows how closely your assessed skills align with the role's profile.",
  },
  {
    title: "Generate a roadmap",
    body: "Phases are ordered around your actual gaps, so two people targeting the same role can start in different places.",
  },
  {
    title: "Track progress",
    body: "Mark phases complete, re-assess over time and watch your readiness history move.",
  },
  {
    title: "Ask the AI advisor",
    body: "Get guidance grounded in your own assessment data instead of generic advice.",
  },
];

function HowItWorks() {
  return (
    <PublicPage>
      <PageHero
        eyebrow="How it works"
        title="From a vague aspiration to an ordered plan."
        description="Every step produces something concrete you can act on this week."
      />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <ol className="space-y-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="surface flex gap-5 p-6">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <h2 className="text-lg font-semibold">{step.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/register">Start free assessment</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/careers">Explore careers first</Link>
          </Button>
        </div>
      </section>
    </PublicPage>
  );
}
