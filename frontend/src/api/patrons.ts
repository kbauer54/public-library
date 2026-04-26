import { api } from "./index";

export const PatronsAPI = {
  getAll: () => api.get("/api/patrons"),
  getOne: (id: string) => api.get(`/api/patrons/${id}`),
};
