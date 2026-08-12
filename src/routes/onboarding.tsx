import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CAREERS } from "@/data/careers";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Profile — SkillBridge" },
      { name: "description", content: "Tell SkillBridge about your education, interests and career aspiration." },
      { property: "og:title", content: "Set Up Your Profile — SkillBridge" },
      { property: "og:description", content: "Three quick steps before your first assessment." },
    ],
  }),
  component: Onboarding,
});

const INTERESTS = [
  "Coding",
  "Mathematics",
  "Data",
  "Artificial Intelligence",
  "Design",
  "Business",
  "Cybersecurity",
  "Communication",
  "Creativity",
  "Leadership",
  "Management",
];

function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    education: user?.education ?? "",
    degree: "",
    branch: "",
    college: "",
    study_year: user?.study_year ?? "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const finish = async () => {
    setBusy(true);
    try {
      const updated = await authService.updateProfile({
        ...form,
        interests,
        career_goal_id: goal && goal !== "unsure" ? goal : null,
        onboarded: true,
      });
      setUser(updated);
      toast.success("Profile saved");
      if (!goal || goal === "unsure") void navigate({ to: "/discovery" });
      else void navigate({ to: "/assessment", search: { career: goal } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Set up your profile" subtitle={`Step ${step} of 3`}>
      <div className="mx-auto max-w-2xl">
        <Progress value={(step / 3) * 100} className="mb-8" />

        {step === 1 && (
          <section className="surface space-y-4 p-6">
            <h2 className="text-xl font-semibold">Education</h2>
            {(
              [
                ["education", "Current education level"],
                ["degree", "Degree"],
                ["branch", "Branch / field"],
                ["college", "College or school"],
                ["study_year", "Current year or semester"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={label}
                />
              </div>
            ))}
          </section>
        )}

        {step === 2 && (
          <section className="surface space-y-4 p-6">
            <h2 className="text-xl font-semibold">What interests you?</h2>
            <p className="text-sm text-muted-foreground">Select as many as apply.</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const active = interests.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(i)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="surface space-y-4 p-6">
            <h2 className="text-xl font-semibold">
              What career are you currently interested in?
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[...CAREERS.map((c) => ({ id: c.id, name: c.name })), { id: "unsure", name: "I'm not sure yet" }].map(
                (opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={goal === opt.id}
                    onClick={() => setGoal(opt.id)}
                    className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                      goal === opt.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                    }`}
                  >
                    {opt.name}
                    {opt.id === "unsure" && (
                      <Badge variant="secondary" className="ml-2">
                        Career discovery
                      </Badge>
                    )}
                  </button>
                ),
              )}
            </div>
          </section>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button onClick={() => void finish()} disabled={busy || !goal}>
              {busy ? "Saving…" : "Finish setup"}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
