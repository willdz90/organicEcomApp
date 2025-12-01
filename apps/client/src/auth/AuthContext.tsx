// src/auth/AuthContext.tsx
import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "../api/apiClient";

export interface AuthUser {
  id?: string;
  email: string;
  role?: string;
  sub?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Cargar sesión al montar la app
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // Configuramos el header y preguntamos por /auth/me
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          const res = await api.get<AuthUser>("/auth/me");
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch {
        // Token inválido / expirado
        setUser(null);
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common.Authorization;
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, user } = res.data as {
        accessToken: string;
        user: AuthUser;
      };

      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { email, password });
      const { accessToken, user } = res.data as {
        accessToken: string;
        user: AuthUser;
      };

      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch {
      // si falla da igual, limpiamos igual
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common.Authorization;
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
