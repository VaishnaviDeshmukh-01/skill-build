import { http, mocked, USE_MOCK_BACKEND } from "./api";
import { mockRoadmap } from "./mock-backend";
import type { Roadmap } from "./types";

export const roadmapService = {
  get: (): Promise<Roadmap | null> =>
    USE_MOCK_BACKEND ? mocked(() => mockRoadmap.get()) : http<Roadmap | null>("/roadmap"),

  setProgress: (itemId: string, progress: number): Promise<Roadmap> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockRoadmap.setProgress(itemId, progress), 150)
      : http<Roadmap>(`/roadmap/${itemId}/progress`, { method: "PUT", body: { progress } }),

  complete: (itemId: string): Promise<Roadmap> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockRoadmap.complete(itemId), 150)
      : http<Roadmap>(`/roadmap/${itemId}/complete`, { method: "POST" }),
};
