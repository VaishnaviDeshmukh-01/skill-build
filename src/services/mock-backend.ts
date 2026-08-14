/**
 * IN-BROWSER MOCK BACKEND — DEMO ONLY.
 *
 * This module is a faithful stand-in for the Python FastAPI backend located in
 * `backend/`. It implements the same endpoints, the same scoring rules and the
 * same response shapes, so the UI can be developed and demonstrated before the
 * backend is deployed. Set VITE_API_BASE_URL to switch every service call to
 * the real REST API — no UI code changes required.
 */

import { CAREERS, SKILLS, getSkill, type Career } from "@/data/careers";
import {
  ApiError,
  type Assessment,
  type ChatMessage,
  type CareerMatch,
  type DashboardData,
  type DiscoveryQuestion,
  type GapPriority,
  type KnowledgeQuestion,
  type ProficiencyKey,
  type Recommendation,
  type Roadmap,
  type RoadmapItem,
  type SkillScore,
  type User,
} from "./types";

/* ------------------------------------------------------------------ config */

export const PROFICIENCY_SCALE: { key: ProficiencyKey; label: string; value: number }[] = [
  { key: "never", label: "Never Used", value: 0 },
  { key: "beginner", label: "Beginner", value: 20 },
  { key: "basic", label: "Basic", value: 40 },
  { key: "intermediate", label: "Intermediate", value: 70 },
  { key: "advanced", label: "Advanced", value: 90 },
];

/** Configurable server-side thresholds (backend: config/settings.py). */
export const GAP_THRESHOLDS = { strong: 10, moderate: 30, high: 50 };

export const classifyGap = (gap: number): GapPriority => {
  if (gap <= GAP_THRESHOLDS.strong) return "strong";
  if (gap <= GAP_THRESHOLDS.moderate) return "moderate";
  if (gap <= GAP_THRESHOLDS.high) return "high";
  return "critical";
};

export const PRIORITY_LABEL: Record<GapPriority, string> = {
  strong: "Strong",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
};

/* ------------------------------------------------------------------- store */

/**
 * Demo-mode credential handling.
 *
 * Real passwords are never persisted. On register/login the raw password is
 * immediately converted to a non-reversible digest (salted, iterated FNV-1a)
 * and only that digest is stored in localStorage. This is a placeholder for
 * demo mode only — real authentication must happen on a server that never
 * exposes credentials to the browser.
 */
const PW_SALT = "skillbridge.demo.v1";

export function hashPassword(raw: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  const input = `${PW_SALT}:${raw}:${PW_SALT}`;
  for (let round = 0; round < 512; round++) {
    for (let i = 0; i < input.length; i++) {
      h1 ^= input.charCodeAt(i) + round;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ h1, 0x85ebca6b) >>> 0;
    }
  }
  return `fnv1a512$${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
}

type StoredUser = User & { password_hash: string };

interface DB {
  users: StoredUser[];
  assessments: Assessment[];
  roadmaps: Roadmap[];
  chats: Record<string, ChatMessage[]>;
  activity: Record<string, { id: string; label: string; date: string }[]>;
  session: string | null;
}

// Bumped to v2 so any previously persisted plaintext-password store is discarded.
const STORAGE_KEY = "skillbridge.db.v2";
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const demoUser: StoredUser = {
  id: "demo-student",
  full_name: "Demo Student",
  email: "demo@skillbridge.app",
  password_hash: hashPassword("demo1234"),
  role: "student",
  education: "Undergraduate",
  degree: "B.Tech",
  branch: "Computer Science",
  college: "Demo Institute of Technology",
  study_year: "3rd Year",
  interests: ["Coding", "Data", "Design"],
  career_goal_id: "full-stack-developer",
  onboarded: true,
  is_demo: true,
};

const adminUser: StoredUser = {
  id: "demo-admin",
  full_name: "Demo Admin",
  email: "admin@skillbridge.app",
  password_hash: hashPassword("admin1234"),
  role: "admin",
  interests: [],
  onboarded: true,
  is_demo: true,
};

const DEMO_LEVELS: Record<string, number> = {
  html: 85,
  css: 78,
  javascript: 45,
  react: 20,
  nodejs: 10,
  rest_apis: 30,
  sql: 40,
  git: 72,
  dsa: 35,
  problem_solving: 60,
  communication: 65,
  teamwork: 70,
};

function seed(): DB {
  const db: DB = {
    users: [demoUser, adminUser],
    assessments: [],
    roadmaps: [],
    chats: {},
    activity: {},
    session: null,
  };

  const career = CAREERS.find((c) => c.id === "full-stack-developer")!;
  const history: { offsetDays: number; scale: number }[] = [
    { offsetDays: 62, scale: 0.66 },
    { offsetDays: 34, scale: 0.82 },
    { offsetDays: 2, scale: 1 },
  ];

  history.forEach(({ offsetDays, scale }) => {
    const answers: Record<string, ProficiencyKey> = {};
    const levels: Record<string, number> = {};
    career.skills.forEach((req) => {
      const base = DEMO_LEVELS[req.skill_id] ?? 30;
      const level = Math.round(base * scale);
      levels[req.skill_id] = level;
      answers[req.skill_id] = nearestProficiency(level);
    });
    const created = new Date(Date.now() - offsetDays * 86400000).toISOString();
    db.assessments.push(buildAssessment(demoUser.id, career, levels, answers, created));
  });

  const roadmap = generateRoadmap(demoUser.id, career, db.assessments.at(-1)!);
  if (roadmap.items[0]) {
    roadmap.items[0].status = "completed";
    roadmap.items[0].progress = 100;
  }
  if (roadmap.items[1]) {
    roadmap.items[1].status = "in_progress";
    roadmap.items[1].progress = 45;
  }

  roadmap.progress = computeRoadmapProgress(roadmap.items);
  db.roadmaps.push(roadmap);

  db.activity[demoUser.id] = [
    { id: uid(), label: "Completed Full Stack Developer skill assessment", date: now() },
    { id: uid(), label: "Marked 'Web Foundations' roadmap phase complete", date: now() },
    { id: uid(), label: "Started 'JavaScript Fundamentals' module", date: now() },
  ];

  return db;
}

function nearestProficiency(level: number): ProficiencyKey {
  return PROFICIENCY_SCALE.reduce((best, opt) =>
    Math.abs(opt.value - level) < Math.abs(best.value - level) ? opt : best,
  ).key;
}

let cache: DB | null = null;

function db(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = seed();
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as DB) : seed();
  } catch {
    cache = seed();
  }
  return cache!;
}

function save() {
  if (typeof window === "undefined" || !cache) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable */
  }
}

export function resetMockBackend() {
  cache = seed();
  save();
}

function logActivity(userId: string, label: string) {
  const d = db();
  d.activity[userId] = [{ id: uid(), label, date: now() }, ...(d.activity[userId] ?? [])].slice(
    0,
    12,
  );
}

/* --------------------------------------------------------------- services */

function buildSkillScores(career: Career, levels: Record<string, number>): SkillScore[] {
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
        recommended_action:
          priority === "strong"
            ? "Maintain with practice and use it in a project"
            : priority === "moderate"
              ? "Targeted practice and one focused project"
              : priority === "high"
                ? "Structured learning plus deliberate practice"
                : "Start from fundamentals — make this your next focus",
      } satisfies SkillScore;
    })
    .sort((a, b) => b.gap - a.gap);
}

/** Weighted coverage of required levels — mirrors services/readiness.py */
function computeReadiness(career: Career, levels: Record<string, number>): number {
  let weighted = 0;
  let total = 0;
  career.skills.forEach((req) => {
    const current = levels[req.skill_id] ?? 0;
    const coverage = Math.min(1, current / req.required_level);
    weighted += coverage * req.weight;
    total += req.weight;
  });
  return total === 0 ? 0 : Math.round((weighted / total) * 100);
}

function buildAssessment(
  userId: string,
  career: Career,
  levels: Record<string, number>,
  answers: Record<string, ProficiencyKey>,
  createdAt = now(),
  knowledgeScore: number | null = null,
): Assessment {
  return {
    id: uid(),
    user_id: userId,
    career_id: career.id,
    career_name: career.name,
    created_at: createdAt,
    readiness_score: computeReadiness(career, levels),
    skills: buildSkillScores(career, levels),
    answers,
    knowledge_score: knowledgeScore,
  };
}

function computeRoadmapProgress(items: RoadmapItem[]) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, i) => sum + i.progress, 0) / items.length);
}

/** Personalised: phases are ordered by the size of the gaps they close. */
function generateRoadmap(userId: string, career: Career, assessment: Assessment): Roadmap {
  const gapBySkill = new Map(assessment.skills.map((s) => [s.skill_id, s.gap]));

  const scored = career.learning_path.map((phase) => {
    const gaps = phase.focus_skill_ids.map((id) => gapBySkill.get(id) ?? 0);
    const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
    return { phase, avgGap };
  });

  const ordered = [...scored].sort((a, b) => {
    // Keep dependency order but pull already-strong phases to the end.
    const aDone = a.avgGap <= GAP_THRESHOLDS.strong ? 1 : 0;
    const bDone = b.avgGap <= GAP_THRESHOLDS.strong ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return a.phase.phase - b.phase.phase;
  });

  const items: RoadmapItem[] = ordered.map(({ phase, avgGap }, index) => ({
    id: `${career.id}-p${phase.phase}`,
    phase: index + 1,
    title: phase.title,
    topics: phase.topics,
    project: phase.project,
    estimated_weeks: Math.max(1, Math.round(phase.estimated_weeks * (avgGap > 40 ? 1.2 : 1))),
    focus_skill_ids: phase.focus_skill_ids,
    status: avgGap <= GAP_THRESHOLDS.strong ? "completed" : "not_started",
    progress: avgGap <= GAP_THRESHOLDS.strong ? 100 : 0,
  }));

  return {
    id: uid(),
    career_id: career.id,
    career_name: career.name,
    generated_at: now(),
    items,
    progress: computeRoadmapProgress(items),
  };
}

/* ---------------------------------------------------------------- careers */

export const mockCareers = {
  list: () => CAREERS,
  get: (id: string) => {
    const career = CAREERS.find((c) => c.id === id);
    if (!career) throw new ApiError("Career not found", 404);
    return career;
  },
  skills: (id: string) => mockCareers.get(id).skills,
};

export const mockSkills = { list: () => SKILLS };

/* ------------------------------------------------------------------- auth */

export const mockAuth = {
  register(input: {
    full_name: string;
    email: string;
    password: string;
    education?: string;
    study_year?: string;
  }) {
    const d = db();
    if (d.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new ApiError("An account with this email already exists", 409);
    }
    const user: StoredUser = {
      id: uid(),
      full_name: input.full_name,
      email: input.email,
      password_hash: hashPassword(input.password),
      role: "student",
      education: input.education,
      study_year: input.study_year,
      interests: [],
      career_goal_id: null,
      onboarded: false,
    };
    d.users.push(user);
    d.session = user.id;
    save();
    return { token: `mock.${user.id}`, user: strip(user) };
  },
  login(email: string, password: string) {
    const d = db();
    const user = d.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user || user.password_hash !== hashPassword(password)) {
      throw new ApiError("Incorrect email or password", 401);
    }
    d.session = user.id;
    save();
    return { token: `mock.${user.id}`, user: strip(user) };
  },
  loginDemo(role: "student" | "admin" = "student") {
    const d = db();
    const user = d.users.find((u) => u.id === (role === "admin" ? "demo-admin" : "demo-student"))!;
    d.session = user.id;
    save();
    return { token: `mock.${user.id}`, user: strip(user) };
  },
  logout() {
    db().session = null;
    save();
  },
  me(): User | null {
    const d = db();
    const user = d.users.find((u) => u.id === d.session);
    return user ? strip(user) : null;
  },
  updateProfile(patch: Partial<User>) {
    const d = db();
    const user = d.users.find((u) => u.id === d.session);
    if (!user) throw new ApiError("Not authenticated", 401);
    Object.assign(user, patch);
    save();
    return strip(user);
  },
};

const strip = (u: StoredUser): User => {
  const { password_hash: _passwordHash, ...rest } = u;
  return rest;
};

function requireUser(): User {
  const user = mockAuth.me();
  if (!user) throw new ApiError("Please sign in to continue", 401);
  return user;
}

/* ------------------------------------------------------- career discovery */

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: "q1",
    prompt: "Which activity sounds most enjoyable to you?",
    options: [
      { id: "a", label: "Building an app or website", traits: { coding: 3, product: 1 } },
      { id: "b", label: "Finding patterns in a spreadsheet", traits: { data: 3, math: 2 } },
      { id: "c", label: "Designing a beautiful screen", traits: { design: 3, creativity: 2 } },
      { id: "d", label: "Planning a launch strategy", traits: { business: 3, product: 2 } },
    ],
  },
  {
    id: "q2",
    prompt: "How do you feel about mathematics and statistics?",
    options: [
      { id: "a", label: "I really enjoy them", traits: { math: 3, data: 2, ai: 2 } },
      { id: "b", label: "I'm comfortable when there's a purpose", traits: { math: 2, data: 1 } },
      { id: "c", label: "Neutral", traits: {} },
      { id: "d", label: "I'd rather avoid heavy maths", traits: { design: 1, business: 1 } },
    ],
  },
  {
    id: "q3",
    prompt: "A system breaks right before a deadline. What's your instinct?",
    options: [
      { id: "a", label: "Dig into logs and debug it", traits: { coding: 2, security: 2 } },
      { id: "b", label: "Check the data for anomalies", traits: { data: 3 } },
      { id: "c", label: "Coordinate the team response", traits: { leadership: 3, product: 2 } },
      { id: "d", label: "Communicate clearly with users", traits: { communication: 3 } },
    ],
  },
  {
    id: "q4",
    prompt: "Which compliment would mean the most to you?",
    options: [
      { id: "a", label: "\u201cThat's clever engineering.\u201d", traits: { coding: 3 } },
      { id: "b", label: "\u201cThat insight changed our decision.\u201d", traits: { data: 3 } },
      { id: "c", label: "\u201cThis is beautiful and easy to use.\u201d", traits: { design: 3 } },
      { id: "d", label: "\u201cYou kept everyone aligned.\u201d", traits: { leadership: 3 } },
    ],
  },
  {
    id: "q5",
    prompt: "How interested are you in artificial intelligence?",
    options: [
      { id: "a", label: "Very — I want to build models", traits: { ai: 3, math: 2, coding: 1 } },
      { id: "b", label: "Interested as a user of AI tools", traits: { ai: 1, product: 1 } },
      { id: "c", label: "Mildly curious", traits: {} },
      { id: "d", label: "Not really my thing", traits: { design: 1, business: 1 } },
    ],
  },
  {
    id: "q6",
    prompt: "Pick the task you'd finish first on a Monday morning.",
    options: [
      { id: "a", label: "Write code for a new feature", traits: { coding: 3 } },
      { id: "b", label: "Build a report or dashboard", traits: { data: 3, business: 1 } },
      { id: "c", label: "Sketch wireframes", traits: { design: 3 } },
      { id: "d", label: "Review infrastructure alerts", traits: { cloud: 3, security: 2 } },
    ],
  },
  {
    id: "q7",
    prompt: "How do you feel about protecting systems from attackers?",
    options: [
      { id: "a", label: "Fascinating — I'd love that", traits: { security: 3, cloud: 1 } },
      { id: "b", label: "Interesting but not my main focus", traits: { security: 1 } },
      { id: "c", label: "Neutral", traits: {} },
      { id: "d", label: "Not interested", traits: {} },
    ],
  },
  {
    id: "q8",
    prompt: "Which best describes your creative side?",
    options: [
      { id: "a", label: "Visual — I think in layouts and colour", traits: { design: 3, creativity: 3 } },
      { id: "b", label: "Written — I think in stories and words", traits: { communication: 3, business: 2 } },
      { id: "c", label: "Structural — I think in systems", traits: { coding: 2, cloud: 2 } },
      { id: "d", label: "Analytical — I think in numbers", traits: { data: 3, math: 2 } },
    ],
  },
  {
    id: "q9",
    prompt: "How comfortable are you presenting to a group?",
    options: [
      { id: "a", label: "Very comfortable, I enjoy it", traits: { communication: 3, leadership: 2 } },
      { id: "b", label: "Comfortable with preparation", traits: { communication: 2 } },
      { id: "c", label: "It makes me nervous", traits: { coding: 1, data: 1 } },
      { id: "d", label: "I prefer written communication", traits: { coding: 1 } },
    ],
  },
  {
    id: "q10",
    prompt: "What kind of impact motivates you most?",
    options: [
      { id: "a", label: "Shipping products people use daily", traits: { coding: 2, product: 3 } },
      { id: "b", label: "Helping organisations decide better", traits: { data: 2, business: 3 } },
      { id: "c", label: "Making technology feel human", traits: { design: 3, creativity: 1 } },
      { id: "d", label: "Keeping systems safe and reliable", traits: { security: 3, cloud: 2 } },
    ],
  },
  {
    id: "q11",
    prompt: "Preferred working style?",
    options: [
      { id: "a", label: "Deep focus, long uninterrupted blocks", traits: { coding: 2, ai: 1, math: 1 } },
      { id: "b", label: "Collaborative, lots of discussion", traits: { leadership: 2, communication: 2, product: 1 } },
      { id: "c", label: "Mix of both", traits: { data: 1, design: 1 } },
      { id: "d", label: "Fast-paced with variety", traits: { business: 2, product: 2 } },
    ],
  },
  {
    id: "q12",
    prompt: "Which learning project excites you most for the next month?",
    options: [
      { id: "a", label: "Build and deploy a full web app", traits: { coding: 3, cloud: 1 } },
      { id: "b", label: "Analyse a real dataset end to end", traits: { data: 3, math: 1 } },
      { id: "c", label: "Redesign an app and test it with users", traits: { design: 3, creativity: 2 } },
      { id: "d", label: "Run a small marketing campaign", traits: { business: 3, communication: 2 } },
    ],
  },
];

const CAREER_TRAITS: Record<string, Record<string, number>> = {
  "software-developer": { coding: 3, math: 1, product: 1 },
  "full-stack-developer": { coding: 3, design: 1, product: 1, cloud: 1 },
  "data-analyst": { data: 3, math: 2, communication: 2, business: 1 },
  "data-scientist": { data: 3, math: 3, ai: 2, coding: 1 },
  "ai-ml-engineer": { ai: 3, math: 3, coding: 2, data: 2 },
  "cybersecurity-analyst": { security: 3, cloud: 2, coding: 1 },
  "ui-ux-designer": { design: 3, creativity: 3, communication: 1 },
  "cloud-engineer": { cloud: 3, security: 2, coding: 2 },
  "mobile-app-developer": { coding: 3, design: 2, product: 1 },
  "digital-marketer": { business: 3, communication: 3, creativity: 2 },
  "business-analyst": { business: 3, data: 2, communication: 3 },
  "product-manager": { product: 3, leadership: 3, business: 2, communication: 3 },
};

const TRAIT_LABEL: Record<string, string> = {
  coding: "building software",
  data: "working with data",
  math: "quantitative thinking",
  ai: "artificial intelligence",
  design: "visual design",
  business: "business and growth",
  security: "security",
  cloud: "infrastructure",
  communication: "communication",
  creativity: "creativity",
  leadership: "leading people",
  product: "product thinking",
};

export const mockDiscovery = {
  questions: () => DISCOVERY_QUESTIONS,
  submit(answers: Record<string, string>): CareerMatch[] {
    const traits: Record<string, number> = {};
    DISCOVERY_QUESTIONS.forEach((q) => {
      const chosen = q.options.find((o) => o.id === answers[q.id]);
      if (!chosen) return;
      Object.entries(chosen.traits).forEach(([k, v]) => {
        traits[k] = (traits[k] ?? 0) + v;
      });
    });

    const norm = (vec: Record<string, number>) =>
      Math.sqrt(Object.values(vec).reduce((s, v) => s + v * v, 0)) || 1;
    const userNorm = norm(traits);

    const topTraits = Object.entries(traits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);

    return CAREERS.map((career) => {
      const profile = CAREER_TRAITS[career.id] ?? {};
      const dot = Object.entries(profile).reduce(
        (sum, [k, v]) => sum + v * (traits[k] ?? 0),
        0,
      );
      const similarity = dot / (userNorm * norm(profile));
      const match = Math.max(18, Math.min(96, Math.round(similarity * 100)));
      const overlap = Object.keys(profile).filter((k) => topTraits.includes(k));
      return {
        career_id: career.id,
        career_name: career.name,
        match,
        why:
          overlap.length > 0
            ? `Your answers lean towards ${overlap.map((t) => TRAIT_LABEL[t] ?? t).join(", ")}, which sits at the centre of this role.`
            : `This role only partially overlaps with the strengths shown in your answers.`,
        strengths: topTraits.map((t) => TRAIT_LABEL[t] ?? t),
        key_skills: career.skills.slice(0, 4).map((s) => getSkill(s.skill_id)?.name ?? s.skill_id),
      } satisfies CareerMatch;
    })
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);
  },
};

/* ------------------------------------------------------------- assessment */

export const KNOWLEDGE_QUESTIONS: KnowledgeQuestion[] = [
  {
    id: "k_js_1",
    skill_id: "javascript",
    prompt: "What does Array.map() return?",
    options: [
      "A new array with the results of calling a function on every element",
      "The original array, modified in place",
      "The number of elements in the array",
      "Undefined",
    ],
  },
  {
    id: "k_sql_1",
    skill_id: "sql",
    prompt: "Which clause filters rows after aggregation in SQL?",
    options: ["HAVING", "WHERE", "ORDER BY", "LIMIT"],
  },
  {
    id: "k_react_1",
    skill_id: "react",
    prompt: "What is the main purpose of the key prop in a React list?",
    options: [
      "Help React identify which items changed between renders",
      "Set the CSS class of the element",
      "Store component state",
      "Sort the list automatically",
    ],
  },
  {
    id: "k_py_1",
    skill_id: "python",
    prompt: "Which Python data structure stores unique unordered values?",
    options: ["set", "list", "tuple", "dict"],
  },
  {
    id: "k_git_1",
    skill_id: "git",
    prompt: "Which command creates a new branch and switches to it?",
    options: ["git checkout -b feature", "git branch --delete", "git merge feature", "git pull"],
  },
];

export const KNOWLEDGE_ANSWER_INDEX: Record<string, number> = {
  k_js_1: 0,
  k_sql_1: 0,
  k_react_1: 0,
  k_py_1: 0,
  k_git_1: 0,
};

export const mockAssessment = {
  start(careerId: string) {
    const career = mockCareers.get(careerId);
    const skills = career.skills.map((req) => {
      const skill = getSkill(req.skill_id)!;
      return { ...skill, required_level: req.required_level };
    });
    return {
      assessment_id: uid(),
      career: { id: career.id, name: career.name },
      skills,
      knowledge_questions: KNOWLEDGE_QUESTIONS.filter((q) =>
        career.skills.some((s) => s.skill_id === q.skill_id),
      ),
    };
  },

  submit(input: {
    career_id: string;
    answers: Record<string, ProficiencyKey>;
    knowledge_answers?: Record<string, number>;
  }): Assessment {
    const user = requireUser();
    const career = mockCareers.get(input.career_id);
    const d = db();

    const levels: Record<string, number> = {};
    career.skills.forEach((req) => {
      const key = input.answers[req.skill_id] ?? "never";
      levels[req.skill_id] =
        PROFICIENCY_SCALE.find((p) => p.key === key)?.value ?? 0;
    });

    // Blend self-assessment with objective questions where available.
    let knowledgeScore: number | null = null;
    const ka = input.knowledge_answers ?? {};
    const answered = Object.keys(ka);
    if (answered.length) {
      let correct = 0;
      answered.forEach((qid) => {
        const q = KNOWLEDGE_QUESTIONS.find((x) => x.id === qid);
        if (!q) return;
        const isCorrect = ka[qid] === KNOWLEDGE_ANSWER_INDEX[qid];
        if (isCorrect) correct += 1;
        const base = levels[q.skill_id] ?? 0;
        levels[q.skill_id] = Math.max(
          0,
          Math.min(100, Math.round(base * 0.8 + (isCorrect ? 20 : 0))),
        );
      });
      knowledgeScore = Math.round((correct / answered.length) * 100);
    }

    const assessment = buildAssessment(
      user.id,
      career,
      levels,
      input.answers,
      now(),
      knowledgeScore,
    );
    d.assessments.push(assessment);

    // (Re)generate the personalised roadmap for this career.
    d.roadmaps = d.roadmaps.filter((r) => !(r.career_id === career.id && userOwns(r, user.id)));
    const roadmap = generateRoadmap(user.id, career, assessment);
    (roadmap as Roadmap & { user_id: string }).user_id = user.id;
    d.roadmaps.push(roadmap);

    const dbUser = d.users.find((u) => u.id === user.id);
    if (dbUser) dbUser.career_goal_id = career.id;

    logActivity(user.id, `Completed ${career.name} skill assessment`);
    save();
    return assessment;
  },

  get(id: string) {
    const user = requireUser();
    const found = db().assessments.find((a) => a.id === id && a.user_id === user.id);
    if (!found) throw new ApiError("Assessment not found", 404);
    return found;
  },

  latest(): Assessment | null {
    const user = mockAuth.me();
    if (!user) return null;
    const mine = db().assessments.filter((a) => a.user_id === user.id);
    return mine.at(-1) ?? null;
  },

  history(): Assessment[] {
    const user = requireUser();
    return db()
      .assessments.filter((a) => a.user_id === user.id)
      .slice()
      .reverse();
  },
};

const userOwns = (r: Roadmap, userId: string) =>
  (r as Roadmap & { user_id?: string }).user_id === userId;

/* ---------------------------------------------------------- skill gap/recs */

const WHY_TEXT: Record<string, string> = {
  javascript: "JavaScript is the language behind nearly every interactive web interface, and every front-end framework assumes you already know it.",
  react: "React is the most common way teams build production interfaces, and most job descriptions in this path expect working component knowledge.",
  nodejs: "Node.js lets you use one language across the stack and is how you'll build the APIs your front end consumes.",
  sql: "Almost every application stores data relationally, so querying and modelling data is a daily task in this role.",
  git: "Version control is how professional teams collaborate; without it your work can't safely join a team codebase.",
  python: "Python is the default language for data and automation work in this path.",
  statistics: "Statistics is what separates a real insight from a coincidence in your analysis.",
  machine_learning: "Model building is the core deliverable expected of this role.",
  figma: "Figma is the industry-standard tool teams expect you to work in.",
  communication: "Technical work only creates value when others understand it — this is consistently cited in hiring feedback.",
};

export const mockSkillGap = {
  get(assessmentId: string): { assessment: Assessment; recommendations: Recommendation[] } {
    const assessment = mockAssessment.get(assessmentId);
    const career = mockCareers.get(assessment.career_id);
    const recommendations = assessment.skills
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
    return { assessment, recommendations };
  },
};

/* ---------------------------------------------------------------- roadmap */

export const mockRoadmap = {
  get(): Roadmap | null {
    const user = mockAuth.me();
    if (!user) return null;
    const mine = db().roadmaps.filter(
      (r) => userOwns(r, user.id) || user.id === "demo-student",
    );
    const goal = user.career_goal_id;
    return mine.find((r) => r.career_id === goal) ?? mine.at(-1) ?? null;
  },
  setProgress(itemId: string, progress: number) {
    const roadmap = mockRoadmap.get();
    if (!roadmap) throw new ApiError("No roadmap yet", 404);
    const item = roadmap.items.find((i) => i.id === itemId);
    if (!item) throw new ApiError("Roadmap item not found", 404);
    item.progress = Math.max(0, Math.min(100, Math.round(progress)));
    item.status = item.progress >= 100 ? "completed" : item.progress > 0 ? "in_progress" : "not_started";
    roadmap.progress = computeRoadmapProgress(roadmap.items);
    save();
    return roadmap;
  },
  complete(itemId: string) {
    const roadmap = mockRoadmap.setProgress(itemId, 100);
    const user = requireUser();
    const item = roadmap.items.find((i) => i.id === itemId);
    logActivity(user.id, `Completed roadmap phase: ${item?.title ?? itemId}`);
    save();
    return roadmap;
  },
};

/* -------------------------------------------------------------- dashboard */

export const mockDashboard = {
  get(): DashboardData {
    const user = requireUser();
    const d = db();
    const assessments = d.assessments.filter((a) => a.user_id === user.id);
    const latest = assessments.at(-1) ?? null;
    const roadmap = mockRoadmap.get();
    const career = latest
      ? { id: latest.career_id, name: latest.career_name }
      : user.career_goal_id
        ? { id: user.career_goal_id, name: mockCareers.get(user.career_goal_id).name }
        : null;

    const gaps = latest?.skills ?? [];
    return {
      user,
      career,
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
      readiness_history: assessments.map((a) => ({
        date: a.created_at,
        readiness: a.readiness_score,
      })),
      activity: d.activity[user.id] ?? [],
    };
  },
};

/* --------------------------------------------------------------------- AI */

export const SUGGESTED_QUESTIONS = [
  "What should I learn next?",
  "Which skills are my biggest gaps?",
  "Am I ready for an internship?",
  "What projects should I build?",
  "How can I improve my JavaScript?",
  "Why is my readiness score low?",
];

/**
 * DEMO ADVISOR. In production POST /api/ai/chat is handled by the Python
 * backend (services/ai_advisor.py), which assembles the same context and calls
 * the AI provider using a server-side API key. No key ever reaches the browser.
 */
export const mockAI = {
  history(): ChatMessage[] {
    const user = mockAuth.me();
    if (!user) return [];
    return db().chats[user.id] ?? [];
  },
  chat(question: string): ChatMessage {
    const user = requireUser();
    const d = db();
    const latest = mockAssessment.latest();
    const roadmap = mockRoadmap.get();
    const list = d.chats[user.id] ?? (d.chats[user.id] = []);
    list.push({ id: uid(), role: "user", content: question, created_at: now() });

    const reply: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: buildAdvisorReply(question, latest, roadmap, user),
      created_at: now(),
    };
    list.push(reply);
    save();
    return reply;
  },
  clear() {
    const user = requireUser();
    db().chats[user.id] = [];
    save();
  },
};

function buildAdvisorReply(
  question: string,
  assessment: Assessment | null,
  roadmap: Roadmap | null,
  user: User,
): string {
  const q = question.toLowerCase();
  if (!assessment) {
    return `I don't have assessment data for you yet, ${user.full_name.split(" ")[0]}. Once you complete a skill assessment I can reference your actual skill levels, gaps and readiness score instead of giving generic advice. Start with the assessment for your chosen career and come back here.`;
  }

  const gaps = assessment.skills.filter((s) => s.priority !== "strong");
  const top = gaps[0];
  const strong = assessment.skills.filter((s) => s.priority === "strong");
  const nextPhase = roadmap?.items.find((i) => i.status !== "completed");

  if (q.includes("gap")) {
    return `Your largest gaps for ${assessment.career_name} right now are ${gaps
      .slice(0, 3)
      .map((g) => `${g.skill_name} (${g.current_level}% vs ${g.required_level}% expected)`)
      .join(", ")}. I'd treat ${top?.skill_name} as the anchor — several later skills in this path build on it, so closing it first makes the others faster.`;
  }
  if (q.includes("internship") || q.includes("ready")) {
    return `Your estimated career readiness is ${assessment.readiness_score}% against the skill profile configured for ${assessment.career_name}. That's an alignment estimate, not a hiring prediction. Practically: you have ${strong.length} skills at or near the expected level and ${gaps.filter((g) => g.priority === "critical" || g.priority === "high").length} with significant gaps. Applying while you close ${top?.skill_name} is reasonable if you can show one finished project — reviewers weigh shipped work heavily at this stage.`;
  }
  if (q.includes("project")) {
    return `Build something that forces you to use ${top?.skill_name} rather than read about it. Given your current levels, a good next project is: ${nextPhase?.project ?? "a small end-to-end app in your target stack"}. Keep it small, finish it, deploy it, and write a short README explaining your decisions — that README is often what gets read first.`;
  }
  if (q.includes("javascript")) {
    const js = assessment.skills.find((s) => s.skill_id === "javascript");
    if (js) {
      return `Your JavaScript is at ${js.current_level}% against an expected ${js.required_level}% for ${assessment.career_name}. Work through it in this order: array and object methods, then the DOM, then ES6+ syntax, then async/await and fetch. Don't jump to a framework until async data fetching feels routine — most React confusion is actually unresolved JavaScript confusion.`;
    }
  }
  if (q.includes("why") && q.includes("readiness")) {
    return `Your readiness is ${assessment.readiness_score}% because the score weights each required skill by how important it is to ${assessment.career_name}. The biggest drags are ${gaps
      .slice(0, 2)
      .map((g) => `${g.skill_name} (${g.gap} points below expected)`)
      .join(" and ")}. Because those carry high weight, improving them moves the score much faster than polishing skills you're already strong in.`;
  }
  if (q.includes("career") && (q.includes("match") || q.includes("strength"))) {
    return `Based on your profile you're currently targeting ${assessment.career_name}. Your strongest assessed areas are ${strong
      .slice(0, 3)
      .map((s) => s.skill_name)
      .join(", ") || "still developing"}. If you'd like a broader comparison, run Career Discovery — it produces a compatibility estimate across several paths rather than a single definitive answer.`;
  }

  return `Here's where you stand for ${assessment.career_name}: estimated readiness ${assessment.readiness_score}%, with ${gaps.length} skills below the configured expectation. Your immediate next step is ${nextPhase ? `"${nextPhase.title}"` : "your next roadmap phase"}, focused on ${top?.skill_name ?? "your priority gap"}. Concretely this week: pick 3 focused topics from that phase, spend most of your time writing code rather than watching tutorials, and finish one small artefact you can show.`;
}

/* ------------------------------------------------------------------ admin */

export const mockAdmin = {
  overview() {
    const d = db();
    // Authorization is enforced here, at the data layer, from the stored
    // session — never from a role value supplied by the caller/UI. The real
    // FastAPI `/admin/overview` endpoint must re-check the authenticated
    // user's role server-side and return 403 for non-admins.
    const actor = requireUser();
    if (actor.role !== "admin") {
      throw new ApiError("You don't have permission to view admin analytics", 403);
    }
    const students = d.users.filter((u) => u.role === "student");
    const byCareer: Record<string, number> = {};
    const gapTotals: Record<string, { total: number; count: number }> = {};
    d.assessments.forEach((a) => {
      byCareer[a.career_name] = (byCareer[a.career_name] ?? 0) + 1;
      a.skills.forEach((s) => {
        const entry = (gapTotals[s.skill_name] ??= { total: 0, count: 0 });
        entry.total += s.gap;
        entry.count += 1;
      });
    });
    const avgReadiness = d.assessments.length
      ? Math.round(
          d.assessments.reduce((sum, a) => sum + a.readiness_score, 0) / d.assessments.length,
        )
      : 0;
    return {
      total_users: students.length,
      total_assessments: d.assessments.length,
      average_readiness: avgReadiness,
      completion_rate: students.length
        ? Math.round(
            (new Set(d.assessments.map((a) => a.user_id)).size / students.length) * 100,
          )
        : 0,
      popular_careers: Object.entries(byCareer)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      common_gaps: Object.entries(gapTotals)
        .map(([name, v]) => ({ name, avg_gap: Math.round(v.total / v.count) }))
        .sort((a, b) => b.avg_gap - a.avg_gap)
        .slice(0, 8),
      careers: CAREERS.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        skills: c.skills.length,
        level: c.level,
      })),
      skills: SKILLS,
    };
  },
};
