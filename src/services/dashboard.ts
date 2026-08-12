import { http, mocked, USE_MOCK_BACKEND } from "./api";
import { mockAdmin, mockDashboard } from "./mock-backend";
import type { DashboardData } from "./types";

export const dashboardService = {
  get: (): Promise<DashboardData> =>
    USE_MOCK_BACKEND ? mocked(() => mockDashboard.get()) : http<DashboardData>("/dashboard"),
};

export type AdminOverview = ReturnType<typeof mockAdmin.overview>;

export const adminService = {
  overview: (): Promise<AdminOverview> =>
    USE_MOCK_BACKEND ? mocked(() => mockAdmin.overview()) : http<AdminOverview>("/admin/overview"),
};
