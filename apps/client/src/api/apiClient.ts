// src/api/apiClient.ts
import axios from "axios";

// 🔹 Leemos la URL base desde la variable de entorno de Vite
// En local usará http://localhost:4000/api si no existe VITE_API_URL
const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true, // para enviar cookies (refresh token)
});

// ✅ Al iniciar, si existe accessToken en localStorage, lo metemos al header
try {
  const existingToken = localStorage.getItem("accessToken");
  if (existingToken) {
    api.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
  }
} catch {
  // En caso de que localStorage no exista (SSR o similar), simplemente ignoramos
}

// Interceptor para manejar expiración de token y refrescar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as any;

    // Si el access token expiró, intentamos refrescar UNA sola vez
    // IMPORTANTE: Evitar bucle infinito si el refresh mismo falla (url termina en /auth/refresh)
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;
      try {
        const refreshResponse = await api.post("/auth/refresh");
        const { accessToken } = refreshResponse.data as {
          accessToken: string;
        };

        if (accessToken) {
          try {
            localStorage.setItem("accessToken", accessToken);
          } catch {
            // si localStorage falla, al menos dejamos el header en memoria
          }

          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(original);
      } catch (err) {
        // Si el refresh falla, limpiamos todo y mandamos a login
        try {
          localStorage.removeItem("accessToken");
        } catch {
          // nada
        }
        delete (api.defaults.headers.common as any).Authorization;
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);
