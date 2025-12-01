// src/pages/AdminProductList.tsx
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
  // Si más adelante añades thumbnail, lo puedes usar aquí también
}

export default function AdminProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">(
    "ALL"
  );
  const [countryFilter, setCountryFilter] =
    useState<CountryGroup | "ALL">("ALL");

  const navigate = useNavigate();

  if (!user || (user.role !== "ADMIN" && user.role !== "DATA_ENTRY")) {
    return <Navigate to="/marketplace" replace />;
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (statusFilter !== "ALL") params.status = statusFilter;
        if (countryFilter !== "ALL") params.countryGroup = countryFilter;

        const res = await api.get<Product[]>("/products", { params });
        setProducts(res.data);
      } catch (err) {
        console.error("Error cargando productos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, statusFilter, countryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            Gestión de productos
          </h1>
          <p className="text-sm text-slate-400">
            Revisa y administra todos los productos del sistema.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/products/new")}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
        >
          + Crear producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="ALL">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Archivado</option>
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value as any)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="ALL">Todos los grupos</option>
          <option value="GENERAL">General</option>
          <option value="COD_LATAM">COD Latam</option>
          <option value="PREPAID_LATAM">Prepago Latam</option>
          <option value="US">US</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 border-b border-slate-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          <span>Título</span>
          <span>Grupo</span>
          <span>Estado</span>
          <span className="text-right">Precio venta</span>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-400">Cargando...</div>
        ) : products.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400">
            No hay productos que coincidan con los filtros.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {products.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-4 py-3 text-sm text-slate-100 hover:bg-slate-800/60 cursor-pointer"
                // más adelante podrías navegar a /admin/products/:id/edit
              >
                <div className="truncate">{p.title}</div>
                <div className="text-xs text-slate-300">{p.countryGroup}</div>
                <div className="text-xs">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                      p.status === "PUBLISHED"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : p.status === "DRAFT"
                        ? "bg-slate-500/10 text-slate-300"
                        : "bg-amber-500/10 text-amber-300",
                    ].join(" ")}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-right text-sm">
                  {p.sellPrice ? `$${p.sellPrice}` : "Sin precio"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
