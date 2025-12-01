// src/pages/Dashboard.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const shortName =
    user?.email?.split("@")[0]?.replace(".", " ") || "creador";

  const canSeeAdmin =
    user && ["ADMIN", "DATA_ENTRY", "ANALYST"].includes(user.role || "");

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Hola, <span className="text-[#1f476e]">{shortName}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bienvenido a tu panel de análisis de productos. Desde aquí podrás
          gestionar fichas, publicar en el marketplace y revisar oportunidades.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Card Productos → clickeable */}
        <button
          type="button"
          onClick={() =>
            canSeeAdmin
              ? navigate("/admin/products")
              : navigate("/marketplace")
          }
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#1f476e]/40 transition text-left cursor-pointer"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            Productos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Crea fichas completas con proveedores, creatividades y argumentos
            de venta listos para usar.
          </p>
          <p className="text-[11px] text-[#1f476e] font-semibold mt-2">
            {canSeeAdmin
              ? "Ir a administración de productos →"
              : "Ver productos publicados →"}
          </p>
        </button>

        {/* Card Marketplace → clickeable */}
        <button
          type="button"
          onClick={() => navigate("/marketplace")}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#1f476e]/40 transition text-left cursor-pointer"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            Marketplace
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualiza únicamente productos publicados y listos para compartir
            con alumnos o equipo.
          </p>
          <p className="text-[11px] text-[#1f476e] font-semibold mt-2">
            Ir al marketplace →
          </p>
        </button>

        {/* Card Próximamente (informativa, no clickeable) */}
        <div className="bg-[#bddec6]/40 border border-[#bddec6] rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1f476e]">
            Próximamente
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Métricas, filtros avanzados, integraciones con plataformas de
            anuncios y más herramientas para validar productos.
          </p>
        </div>
      </div>
    </div>
  );
}
