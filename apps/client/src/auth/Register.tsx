// src/auth/Register.tsx
import { useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("No se pudo crear la cuenta. Revisa el email o intenta más tarde.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-8 shadow-xl w-96"
      >
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Registrarse</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 caracteres)"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className="text-red-500 text-sm mb-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-emerald-500 text-white p-2 rounded"
        >
          Crear cuenta
        </button>
        <p className="text-sm text-center mt-4">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-emerald-600 font-semibold">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
}
