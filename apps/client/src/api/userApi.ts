import { api } from "./apiClient";

export interface MeResponse {
  id: string;
  email: string;
  name?: string;
  role: string;
  plan: string;
  isActive: boolean;
  country?: string;
  timezone?: string;
  createdAt: string;
}

export async function fetchMe() {
  const { data } = await api.get<MeResponse>("/users/me");
  return data;
}

export async function updateProfile(payload: {
  name?: string;
  country?: string;
  timezone?: string;
}) {
  const { data } = await api.patch<MeResponse>("/users/me", payload);
  return data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const { data } = await api.post("/users/change-password", payload);
  return data as { message: string };
}
