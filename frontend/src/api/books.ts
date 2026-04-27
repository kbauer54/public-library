import { api } from "./index";

export const BooksAPI = {
  getAll: async () => {
    const res = await api.get("/api/books");

    // Normalize all possible shapes:
    // { data: { data: [...] } }
    // { data: [...] }
    // [...]
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },
  getOne: (id: string) => api.get(`/api/books/${id}`),
  create: (data: any) => api.post("/api/books", data),
  update: (id: string, data: any) => api.put(`/api/books/${id}`, data),
  delete: (id: string) => api.delete(`/api/books/${id}`),
};
