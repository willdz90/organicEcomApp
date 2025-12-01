// src/auth/Login.tsx
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión, no tiene sentido estar en /login → redirigimos
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Error en login", err?.response || err);
      setError(
        err?.response?.data?.message ||
          "No se pudo iniciar sesión. Revisa tus credenciales."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-6 rounded-xl shadow-md w-full max-w-sm border border-slate-800"
      >
        <h1 className="text-xl font-semibold mb-4 text-slate-50 text-center">
          Iniciar sesión
        </h1>

        {error && (
          <p className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-700/60 rounded px-2 py-1">
            {error}
          </p>
        )}

        <div className="mb-3">
          <label className="block text-xs text-slate-400 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            className="w-full p-2 rounded bg-slate-950 border border-slate-700 text-sm text-slate-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full p-2 rounded bg-slate-950 border border-slate-700 text-sm text-slate-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white p-2 rounded text-sm font-semibold transition-colors"
        >
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>

        <p className="text-sm text-center mt-4 text-slate-400">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-emerald-400 font-semibold">
            Regístrate
          </a>
        </p>
      </form>
    </div>
  );
}
