import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
import { DemoBadge, EmptyState, ErrorState } from "@/components/state-views";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { dashboardService } from "@/services/dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Career Dashboard — SkillBridge" },
      {
        name: "description",
        content:
          "Track your target career, readiness estimate, priority skill gaps, roadmap progress and recent activity.",
      },
      { property: "og:title", content: "Your Career Dashboard — SkillBridge" },
      { property: "og:description", content: "Readiness, gaps and progress in one view." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.get,
    enabled: Boolean(user),
  });

  return (
    <AppShell
      title={`${greeting()}, ${user?.full_name.split(" ")[0] ?? "there"} 👋`}
      subtitle="Here's where you stand today"
      actions={user?.is_demo ? <DemoBadge /> : undefined}
    >
      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : isError || !data ? (
        <ErrorState
          message="We couldn't load your dashboard. Please try again."
          onRetry={() => void refetch()}
        />
      ) : !data.career ? (
        <EmptyState
          title="Pick a career goal to get started"
          description="Choose a target career, then take the skill assessment to unlock your dashboard."
          action={
            <Button asChild>
              <Link to="/careers">Explore careers</Link>
            </Button>
          }
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Target career" value={data.career.name} />
            <Stat label="Estimated career readiness" value={`${data.readiness}%`} progress={data.readiness} />
            <Stat label="Priority skill gaps" value={String(data.priority_gaps)} />
            <Stat
              label="Roadmap progress"
              value={`${data.roadmap_progress}%`}
              progress={data.roadmap_progress}
            />
            <Stat label="Skills assessed" value={String(data.skills_assessed)} />
            <Stat label="Phases completed" value={String(data.projects_completed)} />
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <Panel title="Skill radar">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={data.radar.map((r) => ({
                      skill: r.skill,
                      Current: r.current,
                      Required: r.required,
                    }))}
                    outerRadius="70%"
                  >
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                    <Radar
                      dataKey="Required"
                      stroke="var(--color-chart-2)"
                      fill="var(--color-chart-2)"
                      fillOpacity={0.2}
                    />
                    <Radar
                      dataKey="Current"
                      stroke="var(--color-chart-1)"
                      fill="var(--color-chart-1)"
                      fillOpacity={0.35}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Largest skill gaps">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.gaps.filter((g) => g.gap > 0).slice(0, 7).map((g) => ({
                      skill: g.skill_name,
                      Gap: g.gap,
                    }))}
                    layout="vertical"
                    margin={{ left: 24 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="skill" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="Gap" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Readiness over time">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.readiness_history.map((h) => ({
                      date: new Date(h.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      }),
                      Readiness: h.readiness,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Readiness"
                      stroke="var(--color-chart-1)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Recent activity">
              <ul className="space-y-3">
                {data.activity.length === 0 && (
                  <li className="text-sm text-muted-foreground">No activity yet.</li>
                )}
                {data.activity.map((a) => (
                  <li key={a.id} className="flex gap-3 text-sm">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                    <div>
                      <p>{a.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.date).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/results">View full skill gap analysis</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/roadmap">Continue roadmap</Link>
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Stat({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress?: number;
}) {
  return (
    <div className="surface p-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      {progress !== undefined && <Progress value={progress} className="mt-3 h-1.5" />}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface p-6">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </div>
  );
}
