import { api } from "./index";

export const BranchesAPI = {
  getAll: () => api.get("/api/branches"),
  getOne: (id: string) => api.get(`/api/branches/${id}`),
  create: (data: any) => api.post("/api/branches", data),
  update: (id: string, data: any) => api.put(`/api/branches/${id}`, data),
  delete: (id: string) => api.delete(`/api/branches/${id}`),
};
