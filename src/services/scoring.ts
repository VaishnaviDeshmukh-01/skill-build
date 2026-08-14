/**
 * Pure scoring rules shared by the in-browser demo backend and the
 * Lovable Cloud persistence layer. These mirror the Python reference
 * implementation in `backend/app/services/`.
 */

import { getCareer, getSkill, type Career } from "@/data/careers";
import {
  GAP_THRESHOLDS,
  KNOWLEDGE_ANSWER_INDEX,
  KNOWLEDGE_QUESTIONS,
  PROFICIENCY_SCALE,
  classifyGap,
} from "./mock-backend";
import type {
  Assessment,
  ProficiencyKey,
  Recommendation,
  RoadmapItem,
  SkillScore,
} from "./types";

export { GAP_THRESHOLDS, PROFICIENCY_SCALE, classifyGap };

const ACTION: Record<string, string> = {
  strong: "Maintain with practice and use it in a project",
  moderate: "Targeted practice and one focused project",
  high: "Structured learning plus deliberate practice",
  critical: "Start from fundamentals — make this your next focus",
};

export function levelsFromAnswers(
  career: Career,
  answers: Record<string, ProficiencyKey>,
): Record<string, number> {
  const levels: Record<string, number> = {};
  career.skills.forEach((req) => {
    const key = answers[req.skill_id] ?? "never";
    levels[req.skill_id] = PROFICIENCY_SCALE.find((p) => p.key === key)?.value ?? 0;
  });
  return levels;
}

/** Blends objective quiz answers into the self-reported levels. */
export function applyKnowledge(
  levels: Record<string, number>,
  knowledgeAnswers: Record<string, number>,
): number | null {
  const answered = Object.keys(knowledgeAnswers);
  if (!answered.length) return null;
  let correct = 0;
  answered.forEach((qid) => {
    const q = KNOWLEDGE_QUESTIONS.find((x) => x.id === qid);
    if (!q) return;
    const isCorrect = knowledgeAnswers[qid] === KNOWLEDGE_ANSWER_INDEX[qid];
    if (isCorrect) correct += 1;
    const base = levels[q.skill_id] ?? 0;
    levels[q.skill_id] = Math.max(0, Math.min(100, Math.round(base * 0.8 + (isCorrect ? 20 : 0))));
  });
  return Math.round((correct / answered.length) * 100);
}

export function buildSkillScores(
  career: Career,
  levels: Record<string, number>,
): SkillScore[] {
  return career.skills
    .map((req) => {
      const skill = getSkill(req.skill_id);
      const current = Math.round(levels[req.skill_id] ?? 0);
      const gap = Math.max(0, req.required_level - current);
      const priority = classifyGap(gap);
      return {
        skill_id: req.skill_id,
        skill_name: skill?.name ?? req.skill_id,
        category: skill?.category ?? "technical",
        current_level: current,
        required_level: req.required_level,
        gap,
        priority,
        recommended_action: ACTION[priority] ?? ACTION["moderate"]!,
      } satisfies SkillScore;
    })
    .sort((a, b) => b.gap - a.gap);
}

/** Weighted coverage of the required levels for the career. */
export function computeReadiness(career: Career, levels: Record<string, number>): number {
  let weighted = 0;
  let total = 0;
  career.skills.forEach((req) => {
    const current = levels[req.skill_id] ?? 0;
    weighted += Math.min(1, current / req.required_level) * req.weight;
    total += req.weight;
  });
  return total === 0 ? 0 : Math.round((weighted / total) * 100);
}

export function computeRoadmapProgress(items: { progress: number }[]): number {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, i) => sum + i.progress, 0) / items.length);
}

/** Phases ordered so the largest gaps are tackled first. */
export function buildRoadmapItems(
  career: Career,
  skills: SkillScore[],
): Omit<RoadmapItem, "id">[] {
  const gapBySkill = new Map(skills.map((s) => [s.skill_id, s.gap]));

  const scored = career.learning_path.map((phase) => {
    const gaps = phase.focus_skill_ids.map((id) => gapBySkill.get(id) ?? 0);
    const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
    return { phase, avgGap };
  });

  const ordered = [...scored].sort((a, b) => {
    const aDone = a.avgGap <= GAP_THRESHOLDS.strong ? 1 : 0;
    const bDone = b.avgGap <= GAP_THRESHOLDS.strong ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return a.phase.phase - b.phase.phase;
  });

  return ordered.map(({ phase, avgGap }, index) => ({
    phase: index + 1,
    title: phase.title,
    topics: phase.topics,
    project: phase.project,
    estimated_weeks: Math.max(1, Math.round(phase.estimated_weeks * (avgGap > 40 ? 1.2 : 1))),
    focus_skill_ids: phase.focus_skill_ids,
    status: avgGap <= GAP_THRESHOLDS.strong ? "completed" : "not_started",
    progress: avgGap <= GAP_THRESHOLDS.strong ? 100 : 0,
  }));
}

const WHY_TEXT: Record<string, string> = {
  javascript:
    "JavaScript is the language behind nearly every interactive web interface, and every front-end framework assumes you already know it.",
  react:
    "React is the most common way teams build production interfaces, and most job descriptions in this path expect working component knowledge.",
  nodejs:
    "Node.js lets you use one language across the stack and is how you'll build the APIs your front end consumes.",
  sql: "Almost every application stores data relationally, so querying and modelling data is a daily task in this role.",
  git: "Version control is how professional teams collaborate; without it your work can't safely join a team codebase.",
  python: "Python is the default language for data and automation work in this path.",
  statistics: "Statistics is what separates a real insight from a coincidence in your analysis.",
  machine_learning: "Model building is the core deliverable expected of this role.",
  figma: "Figma is the industry-standard tool teams expect you to work in.",
  communication:
    "Technical work only creates value when others understand it — this is consistently cited in hiring feedback.",
};

export function buildRecommendations(assessment: Assessment): Recommendation[] {
  const career = getCareer(assessment.career_id);
  if (!career) return [];
  return assessment.skills
    .filter((s) => s.priority !== "strong")
    .slice(0, 6)
    .map((s) => {
      const phase = career.learning_path.find((p) => p.focus_skill_ids.includes(s.skill_id));
      return {
        skill_id: s.skill_id,
        skill_name: s.skill_name,
        current_level: s.current_level,
        required_level: s.required_level,
        priority: s.priority,
        why:
          WHY_TEXT[s.skill_id] ??
          `${s.skill_name} appears in the skill profile configured for ${career.name} at ${s.required_level}% expected proficiency.`,
        learn: phase?.topics ?? ["Fundamentals", "Guided practice", "Applied exercises"],
        project: phase?.project ?? `Build a small project that uses ${s.skill_name} end to end`,
        estimated_weeks: Math.max(1, Math.round(s.gap / 12)),
      } satisfies Recommendation;
    });
}
