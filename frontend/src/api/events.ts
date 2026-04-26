import { api } from "./index";

export const EventsAPI = {
  getAll: () => api.get("/api/events"),
};
