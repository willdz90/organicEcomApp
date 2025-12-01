// src/pages/Marketplace.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/apiClient";
import {
  COUNTRY_GROUP_OPTIONS,
  type CountryGroup,
} from "../config/productConfig";

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
  supplierUrls?: string[] | null;
  socialUrls?: string[] | null;
}

// --- pequeña utilidad para detectar la plataforma de una URL ---
type Platform = "tiktok" | "instagram" | "facebook" | "youtube" | "other";

function detectPlatform(url: string): Platform {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("facebook.com")) return "facebook";
  if (u.includes("youtu.be") || u.includes("youtube.com")) return "youtube";
  return "other";
}

function platformLabel(platform: Platform) {
  switch (platform) {
    case "tiktok":
      return "TT";
    case "instagram":
      return "IG";
    case "facebook":
      return "FB";
    case "youtube":
      return "YT";
    default:
      return "SOC";
  }
}

function platformColorClasses(platform: Platform) {
  switch (platform) {
    case "tiktok":
      return "bg-black text-white";
    case "instagram":
      return "bg-gradient-to-r from-pink-500 to-yellow-400 text-white";
    case "facebook":
      return "bg-blue-600 text-white";
    case "youtube":
      return "bg-red-600 text-white";
    default:
      return "bg-slate-200 text-slate-800";
  }
}

// ---- Card tipo AliExpress (compacta, con imagen cuadrada) ----
function ProductCard({ product: p }: { product: Product }) {
  const [imageIndex, setImageIndex] = useState(0);

  const images: string[] = Array.isArray(p.images)
    ? (p.images as any[])
        .filter((v) => typeof v === "string" && v.trim().length > 0)
        .map((v) => v as string)
    : [];

  const currentImage = images[imageIndex] ?? null;

  const handlePrev = () => {
    if (images.length === 0) return;
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (images.length === 0) return;
    setImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const mainCategory = p.category?.name ?? "Sin categoría";

  const cgArray =
    (p.countryGroups && p.countryGroups.length > 0 ? p.countryGroups : []) ||
    [];

  const ratingNumber =
    p.ratingAvg != null ? Number(p.ratingAvg) || 0 : 0;
  const safeRating =
    ratingNumber < 0 ? 0 : ratingNumber > 5 ? 5 : ratingNumber;
  const stars = Array.from({ length: 5 }).map(
    (_, i) => i < Math.round(safeRating)
  );

  const costNumber =
    p.cost != null ? Number(p.cost) || null : null;
  const sellPriceNumber =
    p.sellPrice != null ? Number(p.sellPrice) || null : null;
  const marginNumber =
    p.marginPct != null ? Number(p.marginPct) || null : null;

  // social: tomamos hasta 3 enlaces
  const socialIcons =
    (p.socialUrls ?? [])
      .filter((u) => typeof u === "string" && u.trim().length > 0)
      .slice(0, 3)
      .map((url) => ({
        url,
        platform: detectPlatform(url),
      })) ?? [];

  // proveedor principal: solo el primero
  const mainSupplier =
    (p.supplierUrls ?? []).find(
      (u) => typeof u === "string" && u.trim().length > 0
    ) || null;

  const isAliExpress =
    mainSupplier && mainSupplier.toLowerCase().includes("aliexpress");

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm hover:shadow-md hover:border-[#1f476e]/40 transition text-[13px]">
      {/* MEDIA: cuadrada */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        {currentImage ? (
          <img
            src={currentImage}
            alt={p.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">
            Sin imagen
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
            >
              ›
            </button>

            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full ${
                    idx === imageIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="p-3 space-y-1.5">
        {/* Título un poco más grande */}
        <h3 className="font-semibold text-slate-900 line-clamp-2 text-[15px]">
          {p.title}
        </h3>

        {/* Rating solo número + estrellas */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {stars.map((filled, idx) => (
              <span
                key={idx}
                className={
                  "text-[10px] " +
                  (filled ? "text-amber-400" : "text-slate-300")
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-[11px] text-slate-600">
            {safeRating.toFixed(1)}
          </span>
        </div>

        {/* Precios: compra y venta */}
        <div className="mt-1 space-y-0.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Compra:</span>
            <span className="font-medium text-slate-800">
              {costNumber != null ? `$${costNumber}` : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Venta:</span>
            <span className="font-semibold text-[#1f476e]">
              {sellPriceNumber != null ? `$${sellPriceNumber}` : "Sin PV"}
            </span>
          </div>
        </div>

        {/* Margen + país */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
          <span>
            {marginNumber != null
              ? `Margen ${marginNumber.toFixed(1)}%`
              : "Sin margen"}
          </span>
          <span className="uppercase">
            {cgArray.length > 0 ? cgArray.join(" · ") : "GLOBAL"}
          </span>
        </div>

        {/* Social + proveedor */}
        {(socialIcons.length > 0 || mainSupplier) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {isAliExpress && mainSupplier && (
              <a
                href={mainSupplier}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-[10px] text-white"
              >
                <span className="font-semibold">AE</span>
                <span>Proveedor</span>
              </a>
            )}

            {socialIcons.map(({ url, platform }, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${platformColorClasses(
                  platform
                )}`}
              >
                {platformLabel(platform)}
              </a>
            ))}
          </div>
        )}

        {/* Categoría + CTA */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
          <span className="truncate max-w-[70%]">{mainCategory}</span>
          <Link
            to={`/products/${p.id}`}
            className="text-[11px] text-blue-600 hover:underline font-medium"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---- Página de marketplace con filtros ----
export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [countryFilter, setCountryFilter] =
    useState<CountryGroup | "ALL">("ALL");

  // filtros extra solo en frontend
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (countryFilter !== "ALL") params.countryGroup = countryFilter;

      const res = await api.get("/products/marketplace", { params });
      setProducts(res.data.data ?? []);
    } catch (err: any) {
      console.error(
        "Error cargando productos marketplace",
        err?.response || err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, countryFilter]);

  // 🧮 Filtros en memoria: precio min/max (COMPRA) y rating mínimo
  const filteredProducts = products.filter((p) => {
    const costValue =
      p.cost != null ? Number(p.cost) || null : null;
    const ratingValue =
      p.ratingAvg != null ? Number(p.ratingAvg) || 0 : 0;

    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        if (costValue == null || costValue < min) return false;
      }
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        if (costValue == null || costValue > max) return false;
      }
    }

    if (minRating) {
      const mr = Number(minRating);
      if (!isNaN(mr) && ratingValue < mr) return false;
    }

    return true;
  });

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Marketplace de{" "}
          <span className="text-[#1f476e]">productos validados</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Aquí verás solo productos{" "}
          <span className="font-semibold">PUBLICADOS</span>, listos para
          analizar o compartir.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* búsqueda */}
        <input
          type="text"
          placeholder="Buscar productos…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full md:w-64 p-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/30"
        />

        {/* país/mercado */}
        <select
          value={countryFilter}
          onChange={(e) =>
            setCountryFilter(e.target.value as CountryGroup | "ALL")
          }
          className="p-2 rounded-lg bg-white border border-slate-200 text-sm"
        >
          <option value="ALL">Todos los mercados</option>
          {COUNTRY_GROUP_OPTIONS.map((cg) => (
            <option key={cg} value={cg}>
              {cg}
            </option>
          ))}
        </select>

        {/* precio COMPRA min / max */}
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Precio compra min."
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-32 p-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/30"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Precio compra máx."
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-32 p-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/30"
        />

        {/* rating mínimo */}
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          placeholder="Rating mín."
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="w-28 p-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/30"
        />
      </div>

      {loading && (
        <p className="text-slate-500 text-sm">Cargando productos...</p>
      )}

      {!loading && filteredProducts.length === 0 && (
        <p className="text-slate-500 text-sm">
          No hay productos publicados que coincidan con los filtros.
        </p>
      )}

      {/* Grid compacta, con menos espacio entre cards */}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
