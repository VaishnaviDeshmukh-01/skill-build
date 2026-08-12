import { http, mocked, USE_MOCK_BACKEND } from "./api";
import { mockAssessment, mockSkillGap } from "./mock-backend";
import type { Assessment, KnowledgeQuestion, ProficiencyKey, Recommendation, Skill } from "./types";

export interface AssessmentStart {
  assessment_id: string;
  career: { id: string; name: string };
  skills: (Skill & { required_level: number })[];
  knowledge_questions: KnowledgeQuestion[];
}

export interface SubmitInput {
  career_id: string;
  answers: Record<string, ProficiencyKey>;
  knowledge_answers?: Record<string, number>;
}

export const assessmentService = {
  start: (careerId: string): Promise<AssessmentStart> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockAssessment.start(careerId))
      : http<AssessmentStart>("/assessment/start", {
          method: "POST",
          body: { career_id: careerId },
        }),

  submit: (input: SubmitInput): Promise<Assessment> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockAssessment.submit(input), 900)
      : http<Assessment>("/assessment/submit", { method: "POST", body: input }),

  get: (id: string): Promise<Assessment> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockAssessment.get(id))
      : http<Assessment>(`/assessment/${id}`),

  latest: (): Promise<Assessment | null> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockAssessment.latest())
      : http<Assessment | null>("/assessment/latest"),

  history: (): Promise<Assessment[]> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockAssessment.history())
      : http<Assessment[]>("/assessment/history"),

  skillGap: (
    assessmentId: string,
  ): Promise<{ assessment: Assessment; recommendations: Recommendation[] }> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockSkillGap.get(assessmentId))
      : http(`/skill-gap/${assessmentId}`),
};
