import { http, mocked, USE_MOCK_BACKEND } from "./api";
import { mockCareers, mockDiscovery, mockSkills } from "./mock-backend";
import type { Career, CareerMatch, DiscoveryQuestion, Skill } from "./types";

export const careersService = {
  list: (): Promise<Career[]> =>
    USE_MOCK_BACKEND ? mocked(() => mockCareers.list()) : http<Career[]>("/careers"),

  get: (id: string): Promise<Career> =>
    USE_MOCK_BACKEND ? mocked(() => mockCareers.get(id)) : http<Career>(`/careers/${id}`),

  skills: (): Promise<Skill[]> =>
    USE_MOCK_BACKEND ? mocked(() => mockSkills.list()) : http<Skill[]>("/skills"),
};

export const discoveryService = {
  questions: (): Promise<DiscoveryQuestion[]> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockDiscovery.questions(), 150)
      : http<DiscoveryQuestion[]>("/discovery/questions"),

  submit: (answers: Record<string, string>): Promise<CareerMatch[]> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockDiscovery.submit(answers), 700)
      : http<CareerMatch[]>("/discovery/submit", { method: "POST", body: { answers } }),
};
