import { api } from "./index";

export const CopiesAPI = {
  getAll: () => api.get("/api/copies"),
  getOne: (id: string) => api.get(`/api/copies/${id}`),
  getByBook: (bookId: string) => api.get(`/api/copies/book/${bookId}`),
  update: (id: string, data: any) => api.put(`/api/copies/${id}`, data),
};
