import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHero, PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingCards } from "@/components/state-views";
import { careersService } from "@/services/careers";

export const Route = createFileRoute("/careers/")({
  head: () => ({
    meta: [
      { title: "Explore Careers — SkillBridge" },
      {
        name: "description",
        content:
          "Browse technology, data, design and business career paths with the skills and proficiency levels each one expects.",
      },
      { property: "og:title", content: "Explore Careers — SkillBridge" },
      {
        property: "og:description",
        content: "Career paths with required skills, learning paths and project ideas.",
      },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  const [q, setQ] = useState("");
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["careers"],
    queryFn: careersService.list,
  });

  const filtered = (data ?? []).filter((c) =>
    `${c.name} ${c.category} ${c.description}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PublicPage>
      <PageHero
        eyebrow="Explore"
        title="Career paths, with the skills each one expects."
        description="Open any career to see required proficiency levels, a learning path and project ideas."
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <label htmlFor="career-search" className="sr-only">
          Search careers
        </label>
        <Input
          id="career-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search careers, e.g. data, design, cloud"
          className="max-w-sm"
        />

        <div className="mt-8">
          {isPending ? (
            <LoadingCards count={6} />
          ) : isError ? (
            <ErrorState
              message="We couldn't load careers right now. Please try again."
              onRetry={() => void refetch()}
            />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No careers match “{q}”.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((career) => (
                <article key={career.id} className="surface flex flex-col p-6">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{career.category}</Badge>
                    <span className="text-xs text-muted-foreground">{career.level}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">{career.name}</h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {career.description}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {career.skills.length} key skills
                  </p>
                  <Button asChild className="mt-4 w-full">
                    <Link to="/careers/$careerId" params={{ careerId: career.id }}>
                      Explore
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicPage>
  );
}
