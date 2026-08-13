import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { ReadinessRing } from "@/components/readiness-ring";
import { EmptyState, ErrorState } from "@/components/state-views";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { assessmentService } from "@/services/assessment";
import { PRIORITY_LABEL } from "@/services/mock-backend";
import type { GapPriority, SkillScore } from "@/services/types";

export const Route = createFileRoute("/results")({
  validateSearch: (search: Record<string, unknown>): { id?: string } =>
    typeof search["id"] === "string" ? { id: search["id"] } : {},
  head: () => ({
    meta: [
      { title: "Your Skill Gap Results — SkillBridge" },
      {
        name: "description",
        content:
          "Your estimated career readiness, skill comparison charts and prioritized skill gaps with recommended next actions.",
      },
      { property: "og:title", content: "Your Skill Gap Results — SkillBridge" },
      { property: "og:description", content: "Readiness estimate, gaps and recommended actions." },
    ],
  }),
  component: Results,
});

const TONE: Record<GapPriority, string> = {
  strong: "text-success",
  moderate: "text-warning",
  high: "text-destructive",
  critical: "text-destructive",
};

function Results() {
  const { id } = Route.useSearch();

  const latest = useQuery({
    queryKey: ["assessment-latest"],
    queryFn: assessmentService.latest,
    enabled: !id,
  });

  const assessmentId = id ?? latest.data?.id;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["skill-gap", assessmentId],
    queryFn: () => assessmentService.skillGap(assessmentId!),
    enabled: Boolean(assessmentId),
  });

  if (!id && latest.isPending)
    return (
      <AppShell title="Results">
        <Skeleton className="h-96 w-full" />
      </AppShell>
    );

  if (!assessmentId)
    return (
      <AppShell title="Results">
        <EmptyState
          title="No assessment yet"
          description="Complete a skill assessment to see your readiness estimate and skill gaps."
          action={
            <Button asChild>
              <Link to="/assessment">Start assessment</Link>
            </Button>
          }
        />
      </AppShell>
    );

  if (isPending)
    return (
      <AppShell title="Results">
        <Skeleton className="h-96 w-full" />
      </AppShell>
    );

  if (isError || !data)
    return (
      <AppShell title="Results">
        <ErrorState
          message="We couldn't load your assessment results. Please try again."
          onRetry={() => void refetch()}
        />
      </AppShell>
    );

  const { assessment, recommendations } = data;
  const group = (fn: (s: SkillScore) => boolean) => assessment.skills.filter(fn);
  const strong = group((s) => s.priority === "strong");
  const improve = group((s) => s.priority === "moderate");
  const priority = group((s) => s.priority === "high" || s.priority === "critical");

  const radarData = assessment.skills.slice(0, 8).map((s) => ({
    skill: s.skill_name,
    Current: s.current_level,
    Required: s.required_level,
  }));
  const barData = assessment.skills
    .filter((s) => s.gap > 0)
    .slice(0, 8)
    .map((s) => ({ skill: s.skill_name, Gap: s.gap }));

  return (
    <AppShell
      title="Assessment results"
      subtitle={assessment.career_name}
      actions={
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/roadmap">View roadmap</Link>
        </Button>
      }
    >
      <section className="surface flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-center">
        <ReadinessRing value={assessment.readiness_score} />
        <div className="max-w-xl">
          <p className="text-sm text-muted-foreground">Your career goal</p>
          <h2 className="font-display text-2xl font-bold">{assessment.career_name}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This score represents how closely your assessed skills currently align with the skill
            profile configured for your selected career. It is an estimate for planning, not an
            official employability score.
          </p>
          {assessment.knowledge_score != null && (
            <p className="mt-2 text-sm">
              Knowledge check: <strong>{assessment.knowledge_score}%</strong> correct
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface p-6">
          <h3 className="font-semibold">Your level vs required level</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <Radar
                  name="Required"
                  dataKey="Required"
                  stroke="var(--color-chart-2)"
                  fill="var(--color-chart-2)"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Current"
                  dataKey="Current"
                  stroke="var(--color-chart-1)"
                  fill="var(--color-chart-1)"
                  fillOpacity={0.35}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-6">
          <h3 className="font-semibold">Largest gaps</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="skill" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Gap" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <GapColumn title="Strong skills" tone="success" skills={strong} />
        <GapColumn title="Improve" tone="warning" skills={improve} />
        <GapColumn title="Priority gaps" tone="destructive" skills={priority} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">What to do about it</h2>
        <div className="mt-4 space-y-4">
          {recommendations.map((rec) => (
            <article key={rec.skill_id} className="surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{rec.skill_name}</h3>
                <Badge variant="outline" className={TONE[rec.priority]}>
                  {PRIORITY_LABEL[rec.priority]} priority
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Current {rec.current_level}% · Required {rec.required_level}% · ~
                {rec.estimated_weeks} weeks of focused effort
              </p>
              <Progress value={rec.current_level} className="mt-3 h-2" />
              <p className="mt-4 text-sm">
                <strong>Why it matters:</strong> {rec.why}
              </p>
              <p className="mt-2 text-sm">
                <strong>What to learn:</strong> {rec.learn.join(" · ")}
              </p>
              <p className="mt-2 text-sm">
                <strong>Suggested project:</strong> {rec.project}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/roadmap">See my personalized roadmap</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/advisor">Ask the AI advisor</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function GapColumn({
  title,
  tone,
  skills,
}: {
  title: string;
  tone: "success" | "warning" | "destructive";
  skills: SkillScore[];
}) {
  const dot =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive";
  return (
    <div className="surface p-6">
      <div className="flex items-center gap-2">
        <span className={`size-2.5 rounded-full ${dot}`} aria-hidden />
        <h3 className="font-semibold">{title}</h3>
        <span className="ml-auto text-sm text-muted-foreground">{skills.length}</span>
      </div>
      <ul className="mt-4 space-y-4">
        {skills.length === 0 && <li className="text-sm text-muted-foreground">Nothing here yet.</li>}
        {skills.map((s) => (
          <li key={s.skill_id}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{s.skill_name}</span>
              <span className="text-muted-foreground tabular-nums">
                {s.current_level}% / {s.required_level}%
              </span>
            </div>
            <Progress value={s.current_level} className="mt-1.5 h-1.5" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Gap {s.gap} · {s.recommended_action}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
