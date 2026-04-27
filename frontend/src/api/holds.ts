import { api } from "./index";

export const HoldsAPI = {
  getAll: () => api.get("/api/holds"),
  getByPatron: (id: string) => api.get(`/api/patrons/${id}/holds`),
};
