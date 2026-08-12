import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState } from "@/components/state-views";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { assessmentService } from "@/services/assessment";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress Tracking — SkillBridge" },
      {
        name: "description",
        content: "See how your readiness estimate and assessed skills have changed over time.",
      },
      { property: "og:title", content: "Progress Tracking — SkillBridge" },
      { property: "og:description", content: "Your readiness history and assessment timeline." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["assessment-history"],
    queryFn: assessmentService.history,
    enabled: Boolean(user),
  });

  return (
    <AppShell title="Progress" subtitle="Your readiness history from real assessments">
      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No history yet"
          description="Each time you complete an assessment we record your readiness estimate here."
          action={
            <Button asChild>
              <Link to="/assessment">Take your first assessment</Link>
            </Button>
          }
        />
      ) : (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {data.map((a) => (
            <li key={a.id}>
              <span
                className="absolute -left-1.5 mt-2 size-3 rounded-full bg-primary"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                {new Date(a.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <h2 className="mt-1 font-semibold">
                {a.career_name} · Readiness {a.readiness_score}%
              </h2>
              <Progress value={a.readiness_score} className="mt-2 h-2 max-w-md" />
              <p className="mt-2 text-sm text-muted-foreground">
                {a.skills.filter((s) => s.priority === "strong").length} strong skills ·{" "}
                {a.skills.filter((s) => s.priority === "high" || s.priority === "critical").length}{" "}
                priority gaps
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link to="/results" search={{ id: a.id }}>
                  View results
                </Link>
              </Button>
            </li>
          ))}
        </ol>
      )}
    </AppShell>
  );
}
