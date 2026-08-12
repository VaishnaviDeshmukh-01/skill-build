import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { assessmentService } from "@/services/assessment";
import { authService } from "@/services/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — SkillBridge" },
      {
        name: "description",
        content: "Manage your education details, interests, career goal and review assessment history.",
      },
      { property: "og:title", content: "Your Profile — SkillBridge" },
      { property: "og:description", content: "Your SkillBridge account details and history." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name ?? "",
    education: user?.education ?? "",
    degree: user?.degree ?? "",
    branch: user?.branch ?? "",
    college: user?.college ?? "",
    study_year: user?.study_year ?? "",
  });
  const [busy, setBusy] = useState(false);

  const history = useQuery({
    queryKey: ["assessment-history"],
    queryFn: assessmentService.history,
    enabled: Boolean(user),
  });

  const save = async () => {
    setBusy(true);
    try {
      const updated = await authService.updateProfile(form);
      setUser(updated);
      toast.success("Profile updated");
    } catch {
      toast.error("We couldn't save your profile. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Profile" subtitle={user?.email}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface space-y-4 p-6">
          <h2 className="text-lg font-semibold">Your details</h2>
          {(
            [
              ["full_name", "Full name"],
              ["education", "Education level"],
              ["degree", "Degree"],
              ["branch", "Branch / field"],
              ["college", "College"],
              ["study_year", "Year"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <Button onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </section>

        <div className="space-y-6">
          <section className="surface p-6">
            <h2 className="text-lg font-semibold">Interests</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(user?.interests ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No interests selected yet.</p>
              )}
              {user?.interests.map((i) => (
                <Badge key={i} variant="secondary">
                  {i}
                </Badge>
              ))}
            </div>
          </section>

          <section className="surface p-6">
            <h2 className="text-lg font-semibold">Assessment history</h2>
            {history.isPending ? (
              <Skeleton className="mt-3 h-24 w-full" />
            ) : (history.data ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No assessments yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {history.data!.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3 text-sm">
                    <span>{a.career_name}</span>
                    <span className="text-muted-foreground">
                      {a.readiness_score}% · {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
