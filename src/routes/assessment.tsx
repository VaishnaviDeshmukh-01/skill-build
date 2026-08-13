import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ErrorState } from "@/components/state-views";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CAREERS } from "@/data/careers";
import { useAuth } from "@/hooks/use-auth";
import { assessmentService } from "@/services/assessment";
import { PROFICIENCY_SCALE } from "@/services/mock-backend";
import type { ProficiencyKey } from "@/services/types";

export const Route = createFileRoute("/assessment")({
  validateSearch: (search: Record<string, unknown>): { career?: string } =>
    typeof search["career"] === "string" ? { career: search["career"] } : {},
  head: () => ({
    meta: [
      { title: "Skill Assessment — SkillBridge" },
      {
        name: "description",
        content:
          "Rate your comfort with each skill your target career requires and get an instant skill gap analysis.",
      },
      { property: "og:title", content: "Skill Assessment — SkillBridge" },
      { property: "og:description", content: "Assess your skills against your target career." },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { career: careerParam } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const careerId = careerParam ?? user?.career_goal_id ?? "full-stack-developer";

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["assessment-start", careerId],
    queryFn: () => assessmentService.start(careerId),
  });

  const [answers, setAnswers] = useState<Record<string, ProficiencyKey>>({});
  const [knowledge, setKnowledge] = useState<Record<string, number>>({});
  const [showKnowledge, setShowKnowledge] = useState(false);

  const submit = useMutation({
    mutationFn: assessmentService.submit,
    onSuccess: (assessment) => {
      toast.success("Assessment complete");
      void navigate({ to: "/results", search: { id: assessment.id } });
    },
    onError: () => toast.error("We couldn't submit your assessment. Please try again."),
  });

  if (isPending)
    return (
      <AppShell title="Skill Assessment">
        <Skeleton className="h-96 w-full" />
      </AppShell>
    );

  if (isError || !data)
    return (
      <AppShell title="Skill Assessment">
        <ErrorState onRetry={() => void refetch()} />
      </AppShell>
    );

  const total = data.skills.length;
  const done = data.skills.filter((s) => answers[s.id]).length;
  const complete = done === total;

  return (
    <AppShell
      title="Skill Assessment"
      subtitle={`${data.career.name} · ${done} of ${total} skills rated`}
      actions={
        <div className="hidden sm:flex">
          <Badge variant="secondary">{data.career.name}</Badge>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {CAREERS.slice(0, 6).map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={c.id === careerId ? "default" : "outline"}
            onClick={() => void navigate({ to: "/assessment", search: { career: c.id } })}
          >
            {c.name}
          </Button>
        ))}
      </div>

      <Progress value={(done / total) * 100} className="mb-8" />

      {(["technical", "soft"] as const).map((cat) => {
        const skills = data.skills.filter((s) => s.category === cat);
        if (!skills.length) return null;
        return (
          <section key={cat} className="mb-10">
            <h2 className="mb-4 text-lg font-semibold">
              {cat === "technical" ? "Technical skills" : "Soft skills"}
            </h2>
            <div className="space-y-3">
              {skills.map((skill) => (
                <fieldset key={skill.id} className="surface p-5">
                  <legend className="sr-only">{skill.name}</legend>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{skill.name}</p>
                    <span className="text-xs text-muted-foreground">
                      Expected: {skill.required_level}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    How comfortable are you with this skill?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PROFICIENCY_SCALE.map((opt) => {
                      const active = answers[skill.id] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setAnswers((a) => ({ ...a, [skill.id]: opt.key }))}
                          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        );
      })}

      {data.knowledge_questions.length > 0 && (
        <section className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Optional knowledge check</h2>
              <p className="text-sm text-muted-foreground">
                A few objective questions make your skill estimate more reliable.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowKnowledge((s) => !s)}>
              {showKnowledge ? "Hide" : "Show questions"}
            </Button>
          </div>
          {showKnowledge && (
            <div className="mt-4 space-y-3">
              {data.knowledge_questions.map((q) => (
                <fieldset key={q.id} className="surface p-5">
                  <legend className="sr-only">{q.prompt}</legend>
                  <p className="font-medium">{q.prompt}</p>
                  <div className="mt-3 grid gap-2">
                    {q.options.map((opt, i) => (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={knowledge[q.id] === i}
                        onClick={() => setKnowledge((k) => ({ ...k, [q.id]: i }))}
                        className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                          knowledge[q.id] === i
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="sticky bottom-4 flex justify-end">
        <Button
          size="lg"
          disabled={!complete || submit.isPending}
          onClick={() =>
            submit.mutate({
              career_id: data.career.id,
              answers,
              knowledge_answers: knowledge,
            })
          }
        >
          {submit.isPending
            ? "Analyzing your skills…"
            : complete
              ? "Submit assessment"
              : `Rate ${total - done} more skill${total - done === 1 ? "" : "s"}`}
        </Button>
      </div>
    </AppShell>
  );
}
