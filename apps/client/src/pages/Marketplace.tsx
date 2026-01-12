// src/pages/Marketplace.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/apiClient";
import {
  COUNTRY_GROUP_OPTIONS,
  type CountryGroup,
} from "../config/productConfig";
import { getCategoryPath } from "../config/categories";
import { Search, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  title: string;
  category?: {
    id?: string;
    name?: string | null;
    slug?: string | null;
  } | null;
  countryGroups?: CountryGroup[] | null;
  sellPrice: string | number | null;
  cost: string | number | null;
  marginPct?: string | number | null;
  status: string;
  images?: any;
  ratingAvg?: string | number | null;
  ratingCount?: number | null;
  supplierUrls?: string[] | null;
  socialUrls?: string[] | null;
}

// --- Card "Aesthetic" estilo Ecom Moderno ---
function ProductCard({ product: p }: { product: Product }) {
  const images: string[] = Array.isArray(p.images)
    ? (p.images as any[]).filter((v) => typeof v === "string" && v.trim().length > 0)
    : [];

  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const displayImage = hoverImage || images[0] || null;

  const rating = Number(p.ratingAvg || 0);
  const sellPrice = Number(p.sellPrice || 0);
  const cost = Number(p.cost || 0);
  const margin = p.marginPct ? Number(p.marginPct) : (sellPrice > 0 ? ((sellPrice - cost) / sellPrice) * 100 : 0);

  return (
    <Link
      to={`/products/${p.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-2px] hover:border-emerald-100 transition-all duration-300 relative h-full flex flex-col"
      onMouseEnter={() => images.length > 1 && setHoverImage(images[1])}
      onMouseLeave={() => setHoverImage(null)}
    >
      {/* IMAGEN */}
      <div className="aspect-square bg-slate-50 relative overflow-hidden shrink-0">
        {displayImage ? (
          <img
            src={displayImage}
            alt={p.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag className="w-8 h-8 opacity-20" />
          </div>
        )}

        {/* Badge Margen - SIEMPRE visible */}
        <div className="absolute bottom-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {margin.toFixed(0)}% Profit
        </div>
      </div>

      {/* INFO BODY - Padding reducido de p-4 a p-3 */}
      <div className="p-3 flex flex-col flex-1">
        {/* Market / Country Groups */}
        <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mb-0.5 truncate">
          {p.countryGroups && p.countryGroups.length > 0
            ? p.countryGroups.map(c => c === 'COD_LATAM' ? 'LATAM' : c).join(" • ")
            : getCategoryPath(p.category?.slug)
          }
        </div>

        {/* Título - Margen reducido mb-2 */}
        <h3 className="text-[13px] leading-snug font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
          {p.title}
        </h3>

        {/* Rating Row - Margen reducido mb-2 */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex text-amber-400 text-sm">
            {"★".repeat(Math.round(rating))}
            <span className="text-slate-200">{"★".repeat(5 - Math.round(rating))}</span>
          </div>
          <span className="text-sm font-bold text-slate-600 leading-none pt-0.5">{rating.toFixed(1)}</span>
        </div>

        {/* Precios - Padding superior reducido pt-2 */}
        <div className="mt-auto pt-2 border-t border-slate-50">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Compra</span>
              <span className="text-lg font-bold text-slate-700">${cost}</span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Venta</span>
              <span className="text-lg font-bold text-[#1f476e]">${sellPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ---- Marketplace Layout ----
export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [countryFilter, setCountryFilter] = useState<CountryGroup | "ALL">("ALL");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (countryFilter !== "ALL") params.countryGroup = countryFilter;

      const res = await api.get("/products/marketplace", { params });
      setProducts(res.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [q, countryFilter]);

  // Filtro de Rating en Frontend
  const filteredIds = products.filter(p => {
    if (ratingFilter === "ALL") return true;
    const r = Number(p.ratingAvg || 0);
    const target = Number(ratingFilter);
    if (target === 5) return r >= 5;
    return Math.floor(r) === target;
  });

  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      {/* HEADER + FILTERS BAR */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <StoreIcon className="text-orange-500" />
                Marketplace
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">Explora productos ganadores validados.</p>
            </div>

            {/* SEARCH BAR MODERN */}
            <div className="flex-1 max-w-lg relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, nicho o keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border-0 rounded-full text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* FILTERS PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {/* BOTÓN FILTROS ELIMINADO AQUI */}

              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value as any)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none shadow-sm transition-all"
              >
                <option value="ALL">🌐 Todo el Mundo</option>
                {COUNTRY_GROUP_OPTIONS.map((cg) => (
                  <option key={cg} value={cg}>{cg}</option>
                ))}
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none shadow-sm transition-all"
              >
                <option value="ALL">⭐ Calif. (Todas)</option>
                <option value="5">⭐⭐⭐⭐⭐ (5.0)</option>
                <option value="4">⭐⭐⭐⭐ (4.0 - 4.9)</option>
                <option value="3">⭐⭐⭐ (3.0 - 3.9)</option>
                <option value="2">⭐⭐ (2.0 - 2.9)</option>
                <option value="1">⭐ (1.0 - 1.9)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          // Skeleton Loading
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredIds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No se encontraron productos</h3>
            <p className="text-slate-500 text-sm mt-1">Intenta ajustar tu búsqueda o filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
            {filteredIds.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${className}`}>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  )
}
