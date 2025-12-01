// src/pages/AdminProducts.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { api } from "../api/apiClient";
import { Navigate, useNavigate } from "react-router-dom";

type CountryGroup = "GENERAL" | "COD_LATAM" | "PREPAID_LATAM" | "US";
type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface Product {
  id: string;
  title: string;
  status: ProductStatus;
  countryGroup: CountryGroup;
  sellPrice: number | null;
}

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ProductStatus | "ALL">("ALL");
  const [countryFilter, setCountryFilter] =
    useState<CountryGroup | "ALL">("ALL");

  // Solo ADMIN / DATA_ENTRY / ANALYST pueden ver el listado interno
  if (
    !user ||
    !["ADMIN", "DATA_ENTRY", "ANALYST"].includes(user.role || "")
  ) {
    return <Navigate to="/dashboard" />;
  }

  const load = async () => {
    setLoadingList(true);
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q; // 🔍 coincide con FindProductsQuery.q en el backend
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (countryFilter !== "ALL") params.countryGroup = countryFilter;

      const res = await api.get("/products", { params });
      setProducts(res.data.data ?? []);
    } catch (err: any) {
      console.error("Error cargando productos", err?.response || err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, statusFilter, countryFilter]);

  const changeStatus = async (id: string, status: ProductStatus) => {
    try {
      await api.patch(`/products/${id}`, { status });
      await load();
    } catch (err: any) {
      console.error("Error cambiando estado", err?.response || err);
      alert("No se pudo cambiar el estado del producto.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de sección */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Gestión de <span className="text-[#1f476e]">productos</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisa y administra todos los productos del sistema.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/products/new")}
          className="px-3 py-2 rounded-lg bg-[#1f476e] text-white text-xs font-semibold hover:bg-[#163553] transition"
        >
          + Crear producto
        </button>
      </div>

      {/* Filtros + tabla */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm space-y-4">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar por título…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full md:w-64 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ProductStatus | "ALL")
            }
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm"
          >
            <option value="ALL">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) =>
              setCountryFilter(e.target.value as CountryGroup | "ALL")
            }
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm"
          >
            <option value="ALL">Todos los grupos</option>
            <option value="GENERAL">General</option>
            <option value="COD_LATAM">COD Latam</option>
            <option value="PREPAID_LATAM">Prepaid Latam</option>
            <option value="US">US</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="mt-2">
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 border-b border-slate-200 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            <span>Título</span>
            <span>Grupo</span>
            <span>Estado</span>
            <span className="text-right">Precio venta</span>
          </div>

          {loadingList && (
            <p className="text-xs text-slate-500 mt-3">
              Cargando productos…
            </p>
          )}

          {!loadingList && products.length === 0 && (
            <p className="text-xs text-slate-500 mt-3">
              No hay productos que coincidan con los filtros.
            </p>
          )}

          <div className="divide-y divide-slate-100 mt-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 py-2 text-sm items-center"
              >
                <div className="truncate">{p.title}</div>

                <div className="text-xs text-slate-500">
                  {p.countryGroup}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                      p.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : p.status === "DRAFT"
                        ? "bg-slate-50 text-slate-600 border border-slate-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200",
                    ].join(" ")}
                  >
                    {p.status}
                  </span>

                  {["ADMIN", "DATA_ENTRY"].includes(user.role || "") && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeStatus(p.id, "DRAFT")}
                        className="text-[10px] px-2 py-0.5 border border-slate-300 rounded-full hover:bg-slate-50"
                      >
                        Borrador
                      </button>
                      <button
                        onClick={() => changeStatus(p.id, "PUBLISHED")}
                        className="text-[10px] px-2 py-0.5 border border-[#1f476e] text-[#1f476e] rounded-full hover:bg-[#1f476e]/5"
                      >
                        Publicar
                      </button>
                      <button
                        onClick={() => changeStatus(p.id, "ARCHIVED")}
                        className="text-[10px] px-2 py-0.5 border border-amber-400 text-amber-700 rounded-full hover:bg-amber-50"
                      >
                        Archivar
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-right text-xs text-slate-700">
                  {p.sellPrice ? `$${p.sellPrice}` : "Sin precio"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
