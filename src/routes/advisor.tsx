import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { aiService } from "@/services/ai";
import { SUGGESTED_QUESTIONS } from "@/services/mock-backend";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "AI Career Advisor — SkillBridge" },
      {
        name: "description",
        content:
          "Ask questions about your career, skills, learning path and progress — answered using your own assessment data.",
      },
      { property: "og:title", content: "AI Career Advisor — SkillBridge" },
      { property: "og:description", content: "Guidance grounded in your assessment results." },
    ],
  }),
  component: Advisor,
});

function Advisor() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [input, setInput] = useState("");

  const { data: messages, isPending } = useQuery({
    queryKey: ["ai-history"],
    queryFn: aiService.history,
    enabled: Boolean(user),
  });

  const send = useMutation({
    mutationFn: aiService.chat,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ai-history"] }),
  });

  const ask = (question: string) => {
    if (!question.trim()) return;
    setInput("");
    send.mutate(question.trim());
  };

  return (
    <AppShell
      title="AI Career Advisor"
      subtitle="Ask questions about your career, skills, learning path and progress."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <Button key={q} size="sm" variant="outline" onClick={() => ask(q)}>
              {q}
            </Button>
          ))}
        </div>

        <div className="surface min-h-[24rem] space-y-4 p-6">
          {isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : !messages || messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your advisor uses your actual assessment data — readiness, gaps and roadmap — to
              answer. Pick a suggested question or type your own.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))
          )}
          {send.isPending && (
            <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              Thinking…
            </div>
          )}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <label htmlFor="advisor-input" className="sr-only">
            Ask a question
          </label>
          <Input
            id="advisor-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your skills, gaps or next steps…"
          />
          <Button type="submit" disabled={send.isPending || !input.trim()}>
            <SendHorizonal className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Send</span>
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          Guidance is educational and based on your assessment data. It does not guarantee jobs,
          internships or income.
        </p>
      </div>
    </AppShell>
  );
}
