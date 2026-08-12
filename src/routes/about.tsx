import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PublicPage } from "@/components/public-page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SkillBridge — Career Readiness for Youth" },
      {
        name: "description",
        content:
          "SkillBridge is a CareerTech platform that helps students turn a career aspiration into a measurable, personalized action plan.",
      },
      { property: "og:title", content: "About SkillBridge" },
      {
        property: "og:description",
        content: "Why SkillBridge exists and how it approaches career readiness honestly.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicPage>
      <PageHero
        eyebrow="About"
        title="Career clarity should not depend on who you know."
        description="SkillBridge exists to give every student the same structured view of their target career that well-connected students get from mentors."
      />
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-16">
        <div>
          <h2 className="text-2xl font-bold">What we do</h2>
          <p className="mt-3 text-muted-foreground">
            We model each career as a profile of skills with expected proficiency levels. You assess
            yourself against that profile, and the platform computes the distance between your
            current level and the expectation — then converts that distance into an ordered plan.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">What we don't do</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>We don't predict salaries or guarantee employment.</li>
            <li>We don't claim our career matches are scientifically definitive.</li>
            <li>We don't publish invented statistics or testimonials.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            Readiness is described as an <strong>estimate of alignment</strong> with a configured
            skill profile — a planning signal, not a verdict.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">How it's built</h2>
          <p className="mt-3 text-muted-foreground">
            A modern React front end talks to a Python FastAPI backend over REST. All scoring —
            career matching, skill gaps, readiness and roadmap generation — runs server-side so the
            rules stay consistent, auditable and configurable.
          </p>
        </div>
      </section>
    </PublicPage>
  );
}
