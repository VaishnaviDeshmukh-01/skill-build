import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/state-views";
import { careersService } from "@/services/careers";
import { CAREERS, getSkill } from "@/data/careers";

export const Route = createFileRoute("/careers/$careerId")({
  head: () => ({
    meta: [
      { title: "Career Details — SkillBridge" },
      {
        name: "description",
        content:
          "Responsibilities, required technical and soft skills, and a recommended learning path for this career.",
      },
      { property: "og:title", content: "Career Details — SkillBridge" },
      {
        property: "og:description",
        content: "See what this career requires and how to get there step by step.",
      },
    ],
  }),
  component: CareerDetail,
});

function CareerDetail() {
  const { careerId } = useParams({ from: "/careers/$careerId" });
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["career", careerId],
    queryFn: () => careersService.get(careerId),
    initialData: () => CAREERS.find((c) => c.id === careerId),
  });

  return (
    <PublicPage>
      <div className="mx-auto max-w-5xl px-4 py-12">
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError || !data ? (
          <ErrorState
            message="We couldn't load this career. Please try again."
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground">
              ← All careers
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge variant="secondary">{data.category}</Badge>
              <span className="text-sm text-muted-foreground">{data.level}</span>
            </div>
            <h1 className="mt-3 text-4xl font-bold">{data.name}</h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{data.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/assessment" search={{ career: data.id }}>
                  Take Skill Assessment
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/discovery">Not sure? Try career discovery</Link>
              </Button>
            </div>

            <section className="mt-12">
              <h2 className="text-2xl font-bold">Responsibilities</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {data.responsibilities.map((r) => (
                  <li key={r} className="surface p-4 text-sm">
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold">Required skills</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Expected proficiency configured for this role.
              </p>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {(["technical", "soft"] as const).map((cat) => (
                  <div key={cat} className="surface p-6">
                    <h3 className="text-sm font-semibold tracking-wide uppercase">
                      {cat === "technical" ? "Technical skills" : "Soft skills"}
                    </h3>
                    <ul className="mt-4 space-y-4">
                      {data.skills
                        .filter((s) => getSkill(s.skill_id)?.category === cat)
                        .map((s) => (
                          <li key={s.skill_id}>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">
                                {getSkill(s.skill_id)?.name ?? s.skill_id}
                              </span>
                              <span className="text-muted-foreground tabular-nums">
                                {s.required_level}%
                              </span>
                            </div>
                            <Progress value={s.required_level} className="mt-1.5 h-2" />
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold">Recommended learning path</h2>
              <ol className="mt-6 space-y-4">
                {data.learning_path.map((p) => (
                  <li key={p.phase} className="surface p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">
                        Phase {p.phase} · {p.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ~{p.estimated_weeks} weeks
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.topics.map((t) => (
                        <Badge key={t} variant="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      <strong className="text-foreground">Project:</strong> {p.project}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <p className="mt-10 rounded-xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
              {data.salary_range_note}
            </p>
          </>
        )}
      </div>
    </PublicPage>
  );
}
