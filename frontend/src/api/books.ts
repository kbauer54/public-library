import { api } from "./index";

export const BooksAPI = {
  getAll: () => api.get("/api/books"),
  getOne: (id: string) => api.get(`/api/books/${id}`),
  create: (data: any) => api.post("/api/books", data),
  update: (id: string, data: any) => api.put(`/api/books/${id}`, data),
  delete: (id: string) => api.delete(`/api/books/${id}`),
};
