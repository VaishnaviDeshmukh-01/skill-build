import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ErrorState, UnauthorizedState } from "@/components/state-views";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { adminService } from "@/services/dashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SkillBridge" },
      {
        name: "description",
        content:
          "Platform overview: registered students, assessments completed, popular careers and the most common skill gaps.",
      },
      { property: "og:title", content: "Admin Dashboard — SkillBridge" },
      { property: "og:description", content: "Careers, skills and assessment analytics." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: adminService.overview,
    enabled: user?.role === "admin",
  });

  if (!loading && user?.role !== "admin") {
    return (
      <AppShell title="Admin" requireAuth={false}>
        <UnauthorizedState />
      </AppShell>
    );
  }

  return (
    <AppShell title="Admin dashboard" subtitle="Platform analytics and configuration">
      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Registered students" value={String(data.total_users)} />
            <Stat label="Assessments completed" value={String(data.total_assessments)} />
            <Stat label="Average readiness" value={`${data.average_readiness}%`} />
            <Stat label="Assessment completion" value={`${data.completion_rate}%`} />
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="surface p-6">
              <h2 className="font-semibold">Most selected careers</h2>
              <ul className="mt-4 space-y-3">
                {data.popular_careers.map((c) => (
                  <li key={c.name} className="flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{c.count} assessments</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface p-6">
              <h2 className="font-semibold">Most common skill gaps</h2>
              <ul className="mt-4 space-y-3">
                {data.common_gaps.map((g) => (
                  <li key={g.name}>
                    <div className="flex justify-between text-sm">
                      <span>{g.name}</span>
                      <span className="text-muted-foreground">avg gap {g.avg_gap}</span>
                    </div>
                    <Progress value={g.avg_gap} className="mt-1.5 h-1.5" />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="surface mt-6 overflow-x-auto p-6">
            <h2 className="font-semibold">Career management</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Career and skill records are served by the backend; editing is handled through the
              admin API.
            </p>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Career</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Configured skills</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.careers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{c.level}</TableCell>
                    <TableCell className="text-right">{c.skills}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="surface mt-6 p-6">
            <h2 className="font-semibold">Skill library</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.skills.map((s) => (
                <Badge key={s.id} variant={s.category === "soft" ? "outline" : "secondary"}>
                  {s.name}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
