import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState } from "@/components/state-views";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { roadmapService } from "@/services/roadmap";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Your Personalized Roadmap — SkillBridge" },
      {
        name: "description",
        content:
          "A phase-by-phase learning plan ordered around your actual skill gaps, with topics and projects for each phase.",
      },
      { property: "og:title", content: "Your Personalized Roadmap — SkillBridge" },
      { property: "og:description", content: "Ordered learning phases based on your skill gaps." },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["roadmap"],
    queryFn: roadmapService.get,
    enabled: Boolean(user),
  });

  const update = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      progress >= 100 ? roadmapService.complete(id) : roadmapService.setProgress(id, progress),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["roadmap"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <AppShell
      title="Personalized roadmap"
      subtitle={data ? `${data.career_name} · ${data.progress}% complete` : undefined}
    >
      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data ? (
        <EmptyState
          title="No roadmap yet"
          description="Complete a skill assessment and we'll generate a roadmap ordered around your gaps."
          action={
            <Button asChild>
              <Link to="/assessment">Take assessment</Link>
            </Button>
          }
        />
      ) : (
        <>
          <Progress value={data.progress} className="mb-8" />
          <ol className="space-y-4">
            {data.items.map((item) => (
              <li key={item.id} className="surface p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Phase {item.phase}
                    </p>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                  </div>
                  <Badge
                    variant={item.status === "completed" ? "default" : "secondary"}
                  >
                    {item.status === "completed"
                      ? "Completed"
                      : item.status === "in_progress"
                        ? "In progress"
                        : `~${item.estimated_weeks} weeks`}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.topics.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  <strong className="text-foreground">Project:</strong> {item.project}
                </p>

                <Progress value={item.progress} className="mt-4 h-2" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {[25, 50, 75].map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant="outline"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: item.id, progress: p })}
                    >
                      {p}%
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    disabled={update.isPending || item.status === "completed"}
                    onClick={() => update.mutate({ id: item.id, progress: 100 })}
                  >
                    Mark complete
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </AppShell>
  );
}
