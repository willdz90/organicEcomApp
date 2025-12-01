// src/api/apiClient.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true, // para enviar cookies (refresh token)
});

// ✅ Al iniciar, si existe accessToken en localStorage, lo metemos al header
const existingToken = localStorage.getItem("accessToken");
if (existingToken) {
  api.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

// Interceptor para manejar expiración de token y refrescar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as any;

    // Si el access token expiró, intentamos refrescar UNA sola vez
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshResponse = await api.post("/auth/refresh");
        const { accessToken } = refreshResponse.data as {
          accessToken: string;
        };

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(original);
      } catch (err) {
        // Si el refresh falla, limpiamos todo y mandamos a login
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common.Authorization;
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
