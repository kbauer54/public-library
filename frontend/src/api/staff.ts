import { api } from "./index";

export const StaffAPI = {
  getMetrics: () => api.get("/api/staff/metrics"),
};
