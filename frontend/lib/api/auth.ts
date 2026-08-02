import { apiClient } from "@/lib/api/client";
import type { Session } from "@/types/user";
import type { LoginInput, SignupInput } from "@/lib/validation/authSchemas";

export const authApi = {
  login: (input: LoginInput) => apiClient.post<Session>("/auth/login", input),
  signup: (input: SignupInput) => apiClient.post<Session>("/auth/signup", input),
  logout: () => apiClient.post<void>("/auth/logout"),
};
