// src/pages/AdminProducts.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { api } from "../api/apiClient";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Filter,
  MoreHorizontal,
  Edit3,
  Archive,
  Globe,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Image as ImageIcon
} from "lucide-react";
import { COUNTRY_GROUP_OPTIONS, type CountryGroup } from "../config/productConfig";
import { getCategoryPath } from "../config/categories";

type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// Ensure CountryGroup is compatible or use the one from config
interface Product {
  id: string;
  title: string;
  status: ProductStatus;
  countryGroups?: CountryGroup[];
  countryGroup?: CountryGroup;
  sellPrice: number | null;
  ratingAvg?: number;
  images?: string[];
}

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">("ALL");
  const [countryFilter, setCountryFilter] = useState<CountryGroup | "ALL">("ALL");

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!user || !["ADMIN", "DATA_ENTRY", "ANALYST"].includes(user.role || "")) {
    return <Navigate to="/dashboard" />;
  }

  const load = async () => {
    setLoadingList(true);
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q;
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
      console.error("Error changing status", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      setDeleteId(null);
      await load();
    } catch (err) {
      console.error("Error eliminando", err);
    }
  };

  const getCountryLabel = (groups?: CountryGroup[] | CountryGroup) => {
    let mainGroup: string = "GENERAL";

    if (Array.isArray(groups) && groups.length > 0) {
      mainGroup = groups[0];
    } else if (typeof groups === 'string') {
      mainGroup = groups;
    }

    // Simple map for flags/icons based on config
    if (mainGroup === "GENERAL") return { icon: <Globe size={14} className="text-indigo-500" />, label: "Global" };
    if (mainGroup === "USA" || mainGroup === "US") return { icon: <span className="text-xs">🇺🇸</span>, label: "USA" };
    if (mainGroup === "Mexico" || mainGroup === "MX") return { icon: <span className="text-xs">🇲🇽</span>, label: "México" };
    if (mainGroup === "Colombia" || mainGroup === "CO") return { icon: <span className="text-xs">🇨🇴</span>, label: "Colombia" };
    if (mainGroup === "Chile" || mainGroup === "CL") return { icon: <span className="text-xs">🇨🇱</span>, label: "Chile" };
    if (mainGroup === "Italia" || mainGroup === "IT") return { icon: <span className="text-xs">🇮🇹</span>, label: "Italia" };
    if (mainGroup === "Francia" || mainGroup === "FR") return { icon: <span className="text-xs">🇫🇷</span>, label: "Francia" };
    if (mainGroup === "Alemania" || mainGroup === "DE") return { icon: <span className="text-xs">🇩🇪</span>, label: "Alemania" };

    // Fallbacks or other countries can be added here
    if (mainGroup === "COD_LATAM") return { icon: <span className="text-xs">🌎</span>, label: "Latam COD" };
    if (mainGroup === "LATAM Anticipado" || mainGroup === "PREPAID_LATAM") return { icon: <span className="text-xs">💳</span>, label: "Latam Prepaid" };
    if (mainGroup === "Paises Bajos" || mainGroup === "NL") return { icon: <span className="text-xs">🇳🇱</span>, label: "Paises Bajos" };
    if (mainGroup === "Polonia" || mainGroup === "PL") return { icon: <span className="text-xs">🇵🇱</span>, label: "Polonia" };
    if (mainGroup === "Hungria" || mainGroup === "HU") return { icon: <span className="text-xs">🇭🇺</span>, label: "Hungria" };

    // Default fallback
    return { icon: <span className="text-xs">🏳️</span>, label: mainGroup };
  };

  const StatusBadge = ({ status }: { status: ProductStatus }) => {
    const styles = {
      PUBLISHED: "bg-emerald-100/50 text-emerald-700 border-emerald-200",
      DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
      ARCHIVED: "bg-amber-50 text-amber-700 border-amber-200"
    };

    const labels = {
      PUBLISHED: "Publicado",
      DRAFT: "Borrador",
      ARCHIVED: "Archivado"
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'PUBLISHED' ? 'bg-emerald-500' : status === 'DRAFT' ? 'bg-slate-400' : 'bg-amber-500'}`}></span>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Sticky Header Wrapper */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 md:-mx-8 md:px-8 pb-4 pt-2 transition-all space-y-4 shadow-sm border-b border-slate-200/50">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Lista de productos
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Gestiona tu catálogo de productos, precios y disponibilidad regional.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/products/new")}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent text-sm focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block self-center"></div>

          {/* Filters */}
          <div className="flex gap-2 p-1 overflow-x-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-300 appearance-none cursor-pointer hover:bg-slate-100 transition"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PUBLISHED">Publicados</option>
                <option value="DRAFT">Borradores</option>
                <option value="ARCHIVED">Archivados</option>
              </select>
            </div>

            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-300 appearance-none cursor-pointer hover:bg-slate-100 transition"
              >
                <option value="ALL">Todas las regiones</option>
                {COUNTRY_GROUP_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Región</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Precio</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingList ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">Cargando inventario...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">No se encontraron productos.</td></tr>
              ) : (
                products.map((p) => {
                  const countryInfo = getCountryLabel(p.countryGroups || p.countryGroup);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden relative">
                            {p.images && p.images.length > 0 ? (
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`absolute inset-0 flex items-center justify-center bg-slate-100 ${p.images && p.images.length > 0 ? 'hidden' : ''}`}>
                              <ImageIcon size={16} className="text-slate-300" />
                            </div>
                          </div>
                          <div className="max-w-[280px]">
                            <p className="font-medium text-slate-800 text-sm truncate" title={p.title}>{p.title}</p>
                            <p className="text-[11px] text-slate-400">ID: {p.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {countryInfo.icon}
                          <span>{countryInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-slate-900 text-sm">
                          {p.sellPrice ? `$${Number(p.sellPrice).toFixed(2)}` : "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {["ADMIN", "DATA_ENTRY"].includes(user.role || "") && (
                          <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="Editar"
                            >
                              <Edit3 size={16} />
                            </button>

                            {p.status === 'PUBLISHED' ? (
                              <button
                                onClick={() => changeStatus(p.id, "DRAFT")}
                                className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                                title="Mover a Borrador"
                              >
                                <Archive size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => changeStatus(p.id, "PUBLISHED")}
                                className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                title="Publicar"
                              >
                                <Globe size={16} />
                              </button>
                            )}

                            {user.role === "ADMIN" && (
                              <button
                                onClick={() => setDeleteId(p.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {
        deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-full">
                  <AlertTriangle size={32} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">¿Eliminar producto?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Esta acción no se puede deshacer. El producto se eliminará permanentemente de la base de datos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition"
                >
                  Si, eliminar
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}
