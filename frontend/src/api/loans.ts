import { api } from "./index";

export const LoansAPI = {
  getAll: () => api.get("/api/loans"),
  getByPatron: (id: string) => api.get(`/api/patrons/${id}/loans`),
  create: (book_id: number, patron_id: string) => api.post("/api/loans", { book_id, patron_id }),
};