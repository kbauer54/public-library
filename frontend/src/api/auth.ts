import { api } from "./index";

export const AuthAPI = {
  patronLogin: (cardNumber: string, pin: string) =>
    api.post("/api/auth/patron", { cardNumber, pin }),

  staffLogin: (email: string, password: string) =>
    api.post("/api/auth/staff", { email, password }),
};
