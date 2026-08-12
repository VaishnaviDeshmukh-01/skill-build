import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ErrorState } from "@/components/state-views";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { discoveryService } from "@/services/careers";
import type { CareerMatch } from "@/services/types";

export const Route = createFileRoute("/discovery")({
  head: () => ({
    meta: [
      { title: "Career Discovery — SkillBridge" },
      {
        name: "description",
        content:
          "Answer a short questionnaire to get an AI-assisted career compatibility estimate across several paths.",
      },
      { property: "og:title", content: "Career Discovery — SkillBridge" },
      { property: "og:description", content: "Find career paths that fit your interests and strengths." },
    ],
  }),
  component: Discovery,
});

function Discovery() {
  const { data: questions, isPending, isError, refetch } = useQuery({
    queryKey: ["discovery-questions"],
    queryFn: discoveryService.questions,
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<CareerMatch[] | null>(null);

  const submit = useMutation({
    mutationFn: discoveryService.submit,
    onSuccess: setResults,
  });

  if (isPending)
    return (
      <AppShell title="Career Discovery" requireAuth={false}>
        <Skeleton className="h-64 w-full" />
      </AppShell>
    );

  if (isError || !questions)
    return (
      <AppShell title="Career Discovery" requireAuth={false}>
        <ErrorState onRetry={() => void refetch()} />
      </AppShell>
    );

  if (results) {
    return (
      <AppShell
        title="Your career matches"
        subtitle="AI-assisted career compatibility estimate — not a definitive result"
        requireAuth={false}
      >
        <div className="space-y-4">
          {results.map((m) => (
            <article key={m.career_id} className="surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{m.career_name}</h2>
                <Badge variant="secondary">{m.match}% compatibility estimate</Badge>
              </div>
              <Progress value={m.match} className="mt-3" />
              <p className="mt-4 text-sm text-muted-foreground">{m.why}</p>
              <p className="mt-3 text-sm">
                <strong>Relevant strengths:</strong> {m.strengths.join(", ")}
              </p>
              <p className="mt-1 text-sm">
                <strong>Important skills:</strong> {m.key_skills.join(", ")}
              </p>
              <Button asChild className="mt-4">
                <Link to="/careers/$careerId" params={{ careerId: m.career_id }}>
                  Explore this career
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </AppShell>
    );
  }

  const q = questions[index]!;
  const answered = answers[q.id];
  const isLast = index === questions.length - 1;

  return (
    <AppShell
      title="Career Discovery"
      subtitle={`Question ${index + 1} of ${questions.length}`}
      requireAuth={false}
    >
      <div className="mx-auto max-w-2xl">
        <Progress value={((index + 1) / questions.length) * 100} className="mb-8" />
        <fieldset className="surface p-6">
          <legend className="sr-only">{q.prompt}</legend>
          <h2 className="text-xl font-semibold">{q.prompt}</h2>
          <div className="mt-5 grid gap-2">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={answered === opt.id}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                  answered === opt.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex justify-between gap-3">
          <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
            Back
          </Button>
          {isLast ? (
            <Button
              disabled={!answered || submit.isPending}
              onClick={() => submit.mutate(answers)}
            >
              {submit.isPending ? "Analyzing…" : "See my matches"}
            </Button>
          ) : (
            <Button disabled={!answered} onClick={() => setIndex((i) => i + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
