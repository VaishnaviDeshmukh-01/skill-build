import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contextSchema = z.object({
  name: z.string().max(120),
  career: z.string().max(120).nullable(),
  readiness: z.number().nullable(),
  gaps: z
    .array(
      z.object({
        skill: z.string().max(120),
        gap: z.number(),
        priority: z.string().max(20),
      }),
    )
    .max(12),
  next_phase: z.string().max(200).nullable(),
});

const inputSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  context: contextSchema,
});

type AdvisorContext = z.infer<typeof contextSchema>;

function systemPrompt(ctx: AdvisorContext): string {
  const gaps = ctx.gaps.length
    ? ctx.gaps.map((g) => `${g.skill} (gap ${g.gap}, ${g.priority} priority)`).join("; ")
    : "no assessment completed yet";
  return [
    "You are the SkillBridge AI Career Advisor for students and early-career learners.",
    "Be encouraging, concrete and specific. Prefer short paragraphs and bullet lists.",
    "Never promise jobs, salaries or guaranteed outcomes; readiness scores are estimates.",
    "Ground every answer in the learner context below and suggest a clear next action.",
    "",
    `Learner: ${ctx.name}`,
    `Target career: ${ctx.career ?? "not chosen yet"}`,
    `Readiness score: ${ctx.readiness ?? "not measured yet"}`,
    `Priority skill gaps: ${gaps}`,
    `Next roadmap phase: ${ctx.next_phase ?? "not generated yet"}`,
  ].join("\n");
}

/** Calls the AI gateway server-side so no API key ever reaches the browser. */
export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return fallbackReply(data.context);

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.5-flash",
          messages: [
            { role: "system", content: systemPrompt(data.context) },
            { role: "user", content: data.message },
          ],
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          return "I'm getting a lot of questions right now — please try again in a moment.";
        }
        console.error("advisor gateway error", res.status);
        return fallbackReply(data.context);
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return json.choices?.[0]?.message?.content?.trim() || fallbackReply(data.context);
    } catch (error) {
      console.error("advisor request failed", error);
      return fallbackReply(data.context);
    }
  });

function fallbackReply(ctx: AdvisorContext): string {
  const top = ctx.gaps[0];
  if (!ctx.career) {
    return "Start with Career Discovery so I can tailor advice to a specific path, then run a skill assessment to see where you stand.";
  }
  if (!top) {
    return `You're tracking ${ctx.career}. Run a skill assessment and I'll turn the results into a focused week-by-week plan.`;
  }
  return [
    `For ${ctx.career}, your biggest lever right now is **${top.skill}** (gap of ${top.gap} points).`,
    ctx.next_phase ? `Your next roadmap phase is "${ctx.next_phase}" — start there.` : "",
    "Spend focused time on it this week and finish with one small project you can show.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
