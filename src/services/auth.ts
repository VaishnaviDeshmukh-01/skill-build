import { http, mocked, setToken, USE_MOCK_BACKEND } from "./api";
import { mockAuth } from "./mock-backend";
import type { User } from "./types";

export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
  education?: string;
  study_year?: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<User> {
    const res = USE_MOCK_BACKEND
      ? await mocked(() => mockAuth.register(input))
      : await http<{ token: string; user: User }>("/auth/register", {
          method: "POST",
          body: input,
        });
    setToken(res.token);
    return res.user;
  },

  async login(email: string, password: string): Promise<User> {
    const res = USE_MOCK_BACKEND
      ? await mocked(() => mockAuth.login(email, password))
      : await http<{ token: string; user: User }>("/auth/login", {
          method: "POST",
          body: { email, password },
        });
    setToken(res.token);
    return res.user;
  },

  async loginDemo(role: "student" | "admin" = "student"): Promise<User> {
    const res = USE_MOCK_BACKEND
      ? await mocked(() => mockAuth.loginDemo(role), 150)
      : await http<{ token: string; user: User }>("/auth/demo", {
          method: "POST",
          body: { role },
        });
    setToken(res.token);
    return res.user;
  },

  async logout(): Promise<void> {
    if (USE_MOCK_BACKEND) await mocked(() => mockAuth.logout(), 80);
    else await http<void>("/auth/logout", { method: "POST" });
    setToken(null);
  },

  async me(): Promise<User | null> {
    if (USE_MOCK_BACKEND) return mocked(() => mockAuth.me(), 120);
    try {
      return await http<User>("/auth/me");
    } catch {
      return null;
    }
  },

  async updateProfile(patch: Partial<User>): Promise<User> {
    if (USE_MOCK_BACKEND) return mocked(() => mockAuth.updateProfile(patch));
    return http<User>("/users/me", { method: "PUT", body: patch });
  },
};
