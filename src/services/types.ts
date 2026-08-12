/** Shared API contract types. These mirror the Pydantic schemas in backend/app/schemas. */

export type { Career, Skill, CareerSkillRequirement, LearningPhase } from "@/data/careers";

export type ProficiencyKey = "never" | "beginner" | "basic" | "intermediate" | "advanced";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "admin";
  education?: string | undefined;
  study_year?: string | undefined;
  degree?: string | undefined;
  branch?: string | undefined;
  college?: string | undefined;
  interests: string[];
  career_goal_id?: string | null;
  onboarded: boolean;
  is_demo?: boolean | undefined;
}

export interface SkillScore {
  skill_id: string;
  skill_name: string;
  category: "technical" | "soft";
  current_level: number;
  required_level: number;
  gap: number;
  priority: GapPriority;
  recommended_action: string;
}

export type GapPriority = "strong" | "moderate" | "high" | "critical";

export interface Assessment {
  id: string;
  user_id: string;
  career_id: string;
  career_name: string;
  created_at: string;
  readiness_score: number;
  skills: SkillScore[];
  answers: Record<string, ProficiencyKey>;
  knowledge_score?: number | null | undefined;
}

export interface Recommendation {
  skill_id: string;
  skill_name: string;
  current_level: number;
  required_level: number;
  priority: GapPriority;
  why: string;
  learn: string[];
  project: string;
  estimated_weeks: number;
}

export interface RoadmapItem {
  id: string;
  phase: number;
  title: string;
  topics: string[];
  project: string;
  estimated_weeks: number;
  focus_skill_ids: string[];
  status: "not_started" | "in_progress" | "completed";
  progress: number;
}

export interface Roadmap {
  id: string;
  career_id: string;
  career_name: string;
  generated_at: string;
  items: RoadmapItem[];
  progress: number;
}

export interface CareerMatch {
  career_id: string;
  career_name: string;
  match: number;
  why: string;
  strengths: string[];
  key_skills: string[];
}

export interface DashboardData {
  user: User;
  career: { id: string; name: string } | null;
  readiness: number;
  priority_gaps: number;
  roadmap_progress: number;
  skills_assessed: number;
  projects_completed: number;
  radar: { skill: string; current: number; required: number }[];
  gaps: SkillScore[];
  readiness_history: { date: string; readiness: number }[];
  activity: { id: string; label: string; date: string }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface DiscoveryQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string; traits: Record<string, number> }[];
}

export interface KnowledgeQuestion {
  id: string;
  skill_id: string;
  prompt: string;
  options: string[];
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
