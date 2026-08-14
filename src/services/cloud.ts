/**
 * Lovable Cloud persistence layer.
 *
 * Every read and write goes through the browser Supabase client, so row level
 * security scopes each query to the signed-in user. Scoring rules live in
 * `scoring.ts` and are shared with the demo backend and the Python reference
 * implementation.
 */

import { supabase } from "@/integrations/supabase/client";
import { CAREERS } from "@/data/careers";
import {
  applyKnowledge,
  buildRoadmapItems,
  buildSkillScores,
  computeReadiness,
  computeRoadmapProgress,
  levelsFromAnswers,
} from "./scoring";
import { ApiError } from "./types";
import type {
  Assessment,
  ChatMessage,
  DashboardData,
  ProficiencyKey,
  Roadmap,
  RoadmapItem,
  SkillScore,
  User,
} from "./types";

const career = (id: string) => {
  const found = CAREERS.find((c) => c.id === id);
  if (!found) throw new ApiError("Career not found", 404);
  return found;
};

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new ApiError("Please sign in to continue.", 401);
  return data.user.id;
}

/* ------------------------------------------------------------------- auth */

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  education: string | null;
  study_year: string | null;
  degree: string | null;
  branch: string | null;
  college: string | null;
  interests: string[];
  career_goal_id: string | null;
  onboarded: boolean;
};

function toUser(row: ProfileRow, role: "student" | "admin"): User {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role,
    education: row.education ?? undefined,
    study_year: row.study_year ?? undefined,
    degree: row.degree ?? undefined,
    branch: row.branch ?? undefined,
    college: row.college ?? undefined,
    interests: row.interests ?? [],
    career_goal_id: row.career_goal_id,
    onboarded: row.onboarded,
  };
}

export const cloudAuth = {
  async me(): Promise<User | null> {
    const { data: sessionData } = await supabase.auth.getUser();
    const authUser = sessionData.user;
    if (!authUser) return null;

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", authUser.id),
    ]);

    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!profile) {
      return {
        id: authUser.id,
        full_name: (authUser.user_metadata?.["full_name"] as string) ?? "",
        email: authUser.email ?? "",
        role: isAdmin ? "admin" : "student",
        interests: [],
        career_goal_id: null,
        onboarded: false,
      };
    }
    return toUser(profile as ProfileRow, isAdmin ? "admin" : "student");
  },

  async register(input: {
    full_name: string;
    email: string;
    password: string;
    education?: string;
    study_year?: string;
  }): Promise<User> {
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: input.full_name },
      },
    });
    if (error) throw new ApiError(error.message, 400);

    const me = await cloudAuth.me();
    if (!me) throw new ApiError("Check your inbox to confirm your email, then sign in.", 401);

    if (input.education || input.study_year) {
      return cloudAuth.updateProfile({
        ...(input.education ? { education: input.education } : {}),
        ...(input.study_year ? { study_year: input.study_year } : {}),
      });
    }
    return me;
  },

  async login(email: string, password: string): Promise<User> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new ApiError("Those credentials didn't match our records.", 401);
    const me = await cloudAuth.me();
    if (!me) throw new ApiError("Sign in failed. Please try again.", 401);
    return me;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async updateProfile(patch: Partial<User>): Promise<User> {
    const userId = await requireUserId();
    const update: Record<string, unknown> = {};
    const fields = [
      "full_name",
      "education",
      "study_year",
      "degree",
      "branch",
      "college",
      "interests",
      "career_goal_id",
      "onboarded",
    ] as const;
    fields.forEach((f) => {
      if (patch[f] !== undefined) update[f] = patch[f];
    });

    const { error } = await supabase.from("profiles").update(update).eq("id", userId);
    if (error) throw new ApiError("We couldn't save your profile.", 400);
    const me = await cloudAuth.me();
    if (!me) throw new ApiError("Please sign in to continue.", 401);
    return me;
  },
};

/* ------------------------------------------------------------ assessments */

type AssessmentRow = {
  id: string;
  user_id: string;
  career_id: string;
  career_name: string;
  created_at: string;
  readiness_score: number;
  knowledge_score: number | null;
  skills: unknown;
  answers: unknown;
};

const toAssessment = (row: AssessmentRow): Assessment => ({
  id: row.id,
  user_id: row.user_id,
  career_id: row.career_id,
  career_name: row.career_name,
  created_at: row.created_at,
  readiness_score: Number(row.readiness_score),
  skills: (row.skills as SkillScore[]) ?? [],
  answers: (row.answers as Record<string, ProficiencyKey>) ?? {},
  knowledge_score: row.knowledge_score,
});

export const cloudAssessment = {
  async submit(input: {
    career_id: string;
    answers: Record<string, ProficiencyKey>;
    knowledge_answers?: Record<string, number>;
  }): Promise<Assessment> {
    const userId = await requireUserId();
    const target = career(input.career_id);

    const levels = levelsFromAnswers(target, input.answers);
    const knowledgeScore = applyKnowledge(levels, input.knowledge_answers ?? {});
    const skills = buildSkillScores(target, levels);
    const readiness = computeReadiness(target, levels);

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        user_id: userId,
        career_id: target.id,
        career_name: target.name,
        readiness_score: readiness,
        knowledge_score: knowledgeScore,
        skills: skills as unknown as never,
        answers: input.answers as unknown as never,
      })
      .select("*")
      .single();
    if (error || !data) throw new ApiError("We couldn't save your assessment.", 400);

    await Promise.all([
      supabase.from("profiles").update({ career_goal_id: target.id }).eq("id", userId),
      supabase.from("readiness_history").insert({
        user_id: userId,
        career_id: target.id,
        readiness,
      }),
      regenerateRoadmap(userId, target.id, skills),
    ]);

    return toAssessment(data as AssessmentRow);
  },

  async get(id: string): Promise<Assessment> {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) throw new ApiError("Assessment not found", 404);
    return toAssessment(data as AssessmentRow);
  },

  async latest(): Promise<Assessment | null> {
    const { data } = await supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    const row = data?.[0];
    return row ? toAssessment(row as AssessmentRow) : null;
  },

  async history(): Promise<Assessment[]> {
    const { data } = await supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map((r) => toAssessment(r as AssessmentRow));
  },
};

/* --------------------------------------------------------------- roadmaps */

async function regenerateRoadmap(userId: string, careerId: string, skills: SkillScore[]) {
  const target = career(careerId);
  const { data: existing } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("user_id", userId)
    .eq("career_id", careerId)
    .maybeSingle();

  let roadmapId = existing?.id;
  if (roadmapId) {
    await supabase.from("roadmap_items").delete().eq("roadmap_id", roadmapId);
    await supabase
      .from("roadmaps")
      .update({ generated_at: new Date().toISOString() })
      .eq("id", roadmapId);
  } else {
    const { data: created } = await supabase
      .from("roadmaps")
      .insert({ user_id: userId, career_id: target.id, career_name: target.name })
      .select("id")
      .single();
    roadmapId = created?.id;
  }
  if (!roadmapId) return;

  const items = buildRoadmapItems(target, skills).map((item) => ({
    ...item,
    roadmap_id: roadmapId,
    user_id: userId,
  }));
  await supabase.from("roadmap_items").insert(items);
}

type RoadmapItemRow = {
  id: string;
  phase: number;
  title: string;
  topics: string[];
  project: string;
  estimated_weeks: number;
  focus_skill_ids: string[];
  status: string;
  progress: number;
};

async function loadRoadmap(): Promise<Roadmap | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("career_goal_id")
    .maybeSingle();

  const { data: roadmaps } = await supabase
    .from("roadmaps")
    .select("*")
    .order("generated_at", { ascending: false });
  if (!roadmaps?.length) return null;

  const chosen =
    roadmaps.find((r) => r.career_id === profile?.career_goal_id) ?? roadmaps[0]!;

  const { data: itemRows } = await supabase
    .from("roadmap_items")
    .select("*")
    .eq("roadmap_id", chosen.id)
    .order("phase", { ascending: true });

  const items: RoadmapItem[] = (itemRows ?? []).map((r) => {
    const row = r as RoadmapItemRow;
    return {
      id: row.id,
      phase: row.phase,
      title: row.title,
      topics: row.topics ?? [],
      project: row.project,
      estimated_weeks: row.estimated_weeks,
      focus_skill_ids: row.focus_skill_ids ?? [],
      status: row.status as RoadmapItem["status"],
      progress: row.progress,
    };
  });

  return {
    id: chosen.id,
    career_id: chosen.career_id,
    career_name: chosen.career_name,
    generated_at: chosen.generated_at,
    items,
    progress: computeRoadmapProgress(items),
  };
}

export const cloudRoadmap = {
  get: loadRoadmap,

  async setProgress(itemId: string, progress: number): Promise<Roadmap> {
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    const status = clamped >= 100 ? "completed" : clamped > 0 ? "in_progress" : "not_started";
    const { error } = await supabase
      .from("roadmap_items")
      .update({ progress: clamped, status })
      .eq("id", itemId);
    if (error) throw new ApiError("We couldn't update your progress.", 400);
    const roadmap = await loadRoadmap();
    if (!roadmap) throw new ApiError("No roadmap yet", 404);
    return roadmap;
  },

  complete: (itemId: string) => cloudRoadmap.setProgress(itemId, 100),
};

/* -------------------------------------------------------------- dashboard */

export const cloudDashboard = {
  async get(): Promise<DashboardData> {
    const user = await cloudAuth.me();
    if (!user) throw new ApiError("Please sign in to continue.", 401);

    const [latest, roadmap, historyRes] = await Promise.all([
      cloudAssessment.latest(),
      loadRoadmap(),
      supabase
        .from("readiness_history")
        .select("readiness, recorded_at")
        .order("recorded_at", { ascending: true }),
    ]);

    const gaps = latest?.skills ?? [];
    const goal = user.career_goal_id
      ? CAREERS.find((c) => c.id === user.career_goal_id)
      : undefined;

    return {
      user,
      career: latest
        ? { id: latest.career_id, name: latest.career_name }
        : goal
          ? { id: goal.id, name: goal.name }
          : null,
      readiness: latest?.readiness_score ?? 0,
      priority_gaps: gaps.filter((g) => g.priority === "high" || g.priority === "critical").length,
      roadmap_progress: roadmap?.progress ?? 0,
      skills_assessed: gaps.length,
      projects_completed: roadmap?.items.filter((i) => i.status === "completed").length ?? 0,
      radar: gaps.slice(0, 8).map((g) => ({
        skill: g.skill_name,
        current: g.current_level,
        required: g.required_level,
      })),
      gaps,
      readiness_history: (historyRes.data ?? []).map((h) => ({
        date: h.recorded_at,
        readiness: Number(h.readiness),
      })),
      activity: (roadmap?.items ?? [])
        .filter((i) => i.status !== "not_started")
        .slice(0, 8)
        .map((i) => ({
          id: i.id,
          label:
            i.status === "completed"
              ? `Completed roadmap phase: ${i.title}`
              : `In progress: ${i.title}`,
          date: roadmap?.generated_at ?? new Date().toISOString(),
        })),
    };
  },
};

/* --------------------------------------------------------------------- AI */

export const cloudAI = {
  async history(): Promise<ChatMessage[]> {
    const { data } = await supabase
      .from("advisor_messages")
      .select("*")
      .order("created_at", { ascending: true });
    return (data ?? []).map((m) => ({
      id: m.id,
      role: m.role as ChatMessage["role"],
      content: m.content,
      created_at: m.created_at,
    }));
  },

  async clear(): Promise<void> {
    const userId = await requireUserId();
    await supabase.from("advisor_messages").delete().eq("user_id", userId);
  },

  /** Persists the question, asks the server-side advisor, persists the reply. */
  async chat(message: string): Promise<ChatMessage> {
    const userId = await requireUserId();
    await supabase.from("advisor_messages").insert({
      user_id: userId,
      role: "user",
      content: message,
    });

    const [latest, roadmap, user] = await Promise.all([
      cloudAssessment.latest(),
      loadRoadmap(),
      cloudAuth.me(),
    ]);

    const { askAdvisor } = await import("@/lib/advisor.functions");
    const reply = await askAdvisor({
      data: {
        message,
        context: {
          name: user?.full_name ?? "there",
          career: latest?.career_name ?? null,
          readiness: latest?.readiness_score ?? null,
          gaps: (latest?.skills ?? [])
            .filter((s) => s.priority !== "strong")
            .slice(0, 6)
            .map((s) => ({ skill: s.skill_name, gap: s.gap, priority: s.priority })),
          next_phase: roadmap?.items.find((i) => i.status !== "completed")?.title ?? null,
        },
      },
    });

    const { data, error } = await supabase
      .from("advisor_messages")
      .insert({ user_id: userId, role: "assistant", content: reply })
      .select("*")
      .single();
    if (error || !data) throw new ApiError("The advisor is unavailable right now.", 503);

    return {
      id: data.id,
      role: "assistant",
      content: data.content,
      created_at: data.created_at,
    };
  },
};
