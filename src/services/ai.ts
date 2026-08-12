import { http, mocked, USE_MOCK_BACKEND } from "./api";
import { mockAI } from "./mock-backend";
import type { ChatMessage } from "./types";

export const aiService = {
  history: (): Promise<ChatMessage[]> =>
    USE_MOCK_BACKEND ? mocked(() => mockAI.history(), 120) : http<ChatMessage[]>("/ai/history"),

  chat: (message: string): Promise<ChatMessage> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockAI.chat(message), 850)
      : http<ChatMessage>("/ai/chat", { method: "POST", body: { message } }),

  clear: (): Promise<void> =>
    USE_MOCK_BACKEND
      ? mocked(() => mockAI.clear(), 80)
      : http<void>("/ai/history", { method: "DELETE" }),
};
