// src/pages/AdminProductCreate.tsx
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { api } from "../api/apiClient";
import { Navigate, useNavigate } from "react-router-dom";
import {
  CATEGORY_OPTIONS,
  COUNTRY_GROUP_OPTIONS,
  type CountryGroup,
} from "../config/productConfig";

type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface FormState {
  title: string;
  description: string;
  category: string; // nombre de categoría (de CATEGORY_OPTIONS)
  countryGroups: CountryGroup[];
  cost: string;
  sellPrice: string;

  supplierUrls: string[];
  socialUrls: string[];
  images: string[];
  tmpSupplierUrl: string;
  tmpSocialUrl: string;
  tmpImageUrl: string;

  whyGood: string;
  filmingApproach: string;
  marketingAngles: string;
  status: ProductStatus;
  ratingAvg: string; // lo convertimos a number al enviar
}

export default function AdminProductCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    countryGroups: ["GENERAL"],
    cost: "",
    sellPrice: "",
    supplierUrls: [],
    socialUrls: [],
    images: [],
    tmpSupplierUrl: "",
    tmpSocialUrl: "",
    tmpImageUrl: "",
    whyGood: "",
    filmingApproach: "",
    marketingAngles: "",
    status: "DRAFT",
    ratingAvg: "",
  });

  // Solo ADMIN / DATA_ENTRY pueden crear
  if (!user || !["ADMIN", "DATA_ENTRY"].includes(user.role || "")) {
    return <Navigate to="/dashboard" />;
  }

  const handleBasicChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCountryGroup = (group: CountryGroup) => {
    setForm((prev) => {
      const exists = prev.countryGroups.includes(group);
      if (exists) {
        const next = prev.countryGroups.filter((g) => g !== group);
        // nunca dejamos el array vacío: si quita el último, volvemos a GENERAL
        return {
          ...prev,
          countryGroups: next.length > 0 ? next : ["GENERAL"],
        };
      } else {
        return {
          ...prev,
          countryGroups: [...prev.countryGroups, group],
        };
      }
    });
  };

  const addUrl = (field: "supplierUrls" | "socialUrls" | "images") => {
    setForm((prev) => {
      const tmpField =
        field === "supplierUrls"
          ? "tmpSupplierUrl"
          : field === "socialUrls"
          ? "tmpSocialUrl"
          : "tmpImageUrl";

      const tmpValue = prev[tmpField as keyof FormState] as string;
      const value = tmpValue.trim();
      if (!value) return prev;
      if (prev[field].includes(value)) {
        // ya existe, no lo duplicamos
        return { ...prev, [tmpField]: "" } as FormState;
      }
      return {
        ...prev,
        [field]: [...prev[field], value],
        [tmpField]: "",
      } as FormState;
    });
  };

  const removeUrl = (
    field: "supplierUrls" | "socialUrls" | "images",
    url: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((u) => u !== url),
    }));
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCreate(true);

    try {
      // ✅ Validación frontend para respetar ArrayMinSize(1) del backend
      if (
        form.supplierUrls.length === 0 ||
        form.socialUrls.length === 0 ||
        form.images.length === 0
      ) {
        alert(
          "Añade al menos 1 URL de proveedor, 1 URL de contenido y 1 URL de imagen (usa el botón + en cada apartado)."
        );
        setLoadingCreate(false);
        return;
      }

      const payload: any = {
        title: form.title,
        description: form.description,
        countryGroups: form.countryGroups,
        cost: Number(form.cost),
        sellPrice: Number(form.sellPrice),
        supplierUrls: form.supplierUrls,
        socialUrls: form.socialUrls,
        images: form.images,
        whyGood: form.whyGood,
        filmingApproach: form.filmingApproach,
        marketingAngles: form.marketingAngles,
        status: form.status,
      };

      // rating opcional
      if (form.ratingAvg.trim().length > 0) {
        payload.ratingAvg = Number(form.ratingAvg);
      }

      // categoría (por ahora solo en frontend; cuando el backend tenga categorías
      // reales, aquí se mapeará a categoryId o metrics)
      if (form.category.trim().length > 0) {
        payload.metrics = {
          ...(payload.metrics || {}),
          categoryLabel: form.category,
        };
      }

      await api.post("/products", payload);

      navigate("/admin/products");
    } catch (err: any) {
      console.error("Error creando producto", err?.response || err);
      alert(
        "No se pudo crear el producto. Revisa que todos los campos estén completos y las URLs sean válidas."
      );
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Crear <span className="text-[#1f476e]">nuevo producto</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Completa la ficha del producto para añadirlo al panel interno.
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={create}
        className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Datos básicos
          </h2>
          <span className="text-[11px] text-slate-500">
            Campos clave obligatorios
          </span>
        </div>

        {/* Datos básicos */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">
              Título del producto
            </label>
            <input
              name="title"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.title}
              onChange={handleBasicChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.description}
              onChange={handleBasicChange}
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Categoría
            </label>
            <select
              name="category"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.category}
              onChange={handleBasicChange}
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Lista dinámica: puedes mantenerla en <code>productConfig.ts</code>.
            </p>
          </div>

          {/* Country groups múltiple */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Country groups
            </label>
            <div className="flex flex-wrap gap-2">
              {COUNTRY_GROUP_OPTIONS.map((opt) => {
                const active = form.countryGroups.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleCountryGroup(opt)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      active
                        ? "bg-[#1f476e] text-white border-[#1f476e]"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Coste (USD)
            </label>
            <input
              type="number"
              step="0.01"
              name="cost"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.cost}
              onChange={handleBasicChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Precio de venta (USD)
            </label>
            <input
              type="number"
              step="0.01"
              name="sellPrice"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.sellPrice}
              onChange={handleBasicChange}
              required
            />
          </div>

          {/* Rating inicial */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Rating inicial (0 a 5, opcional)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              name="ratingAvg"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.ratingAvg}
              onChange={handleBasicChange}
              placeholder="Ej: 4.5"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Estado inicial
            </label>
            <select
              name="status"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.status}
              onChange={handleBasicChange}
              required
            >
              <option value="DRAFT">Borrador (no visible en marketplace)</option>
              <option value="PUBLISHED">
                Publicado (visible en marketplace)
              </option>
              <option value="ARCHIVED">Archivado (oculto, histórico)</option>
            </select>
          </div>
        </div>

        {/* URLs con + */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Proveedor */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              URL de proveedor
            </label>
            <div className="flex gap-2">
              <input
                name="tmpSupplierUrl"
                className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
                placeholder="Pega la URL y pulsa +"
                value={form.tmpSupplierUrl}
                onChange={handleBasicChange}
              />
              <button
                type="button"
                onClick={() => addUrl("supplierUrls")}
                className="px-3 py-2 rounded-lg bg-[#1f476e] text-white text-sm font-semibold hover:bg-[#163553] transition"
              >
                +
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.supplierUrls.map((url) => (
                <span
                  key={url}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
                >
                  <span className="max-w-[150px] truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeUrl("supplierUrls", url)}
                    className="text-slate-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Social / contenido */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              URL de contenido / social
            </label>
            <div className="flex gap-2">
              <input
                name="tmpSocialUrl"
                className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
                placeholder="TikTok, Reels, etc."
                value={form.tmpSocialUrl}
                onChange={handleBasicChange}
              />
              <button
                type="button"
                onClick={() => addUrl("socialUrls")}
                className="px-3 py-2 rounded-lg bg-[#1f476e] text-white text-sm font-semibold hover:bg-[#163553] transition"
              >
                +
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.socialUrls.map((url) => (
                <span
                  key={url}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
                >
                  <span className="max-w-[150px] truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeUrl("socialUrls", url)}
                    className="text-slate-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              URL de imagen
            </label>
            <div className="flex gap-2">
              <input
                name="tmpImageUrl"
                className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
                placeholder="Imagen principal o adicionales"
                value={form.tmpImageUrl}
                onChange={handleBasicChange}
              />
              <button
                type="button"
                onClick={() => addUrl("images")}
                className="px-3 py-2 rounded-lg bg-[#1f476e] text-white text-sm font-semibold hover:bg-[#163553] transition"
              >
                +
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.images.map((url) => (
                <span
                  key={url}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[11px] text-slate-700"
                >
                  <span className="max-w-[150px] truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeUrl("images", url)}
                    className="text-slate-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copy & marketing */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Why Good (por qué es bueno)
            </label>
            <textarea
              name="whyGood"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.whyGood}
              onChange={handleBasicChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Enfoque de filmación
            </label>
            <textarea
              name="filmingApproach"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.filmingApproach}
              onChange={handleBasicChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Ángulos de marketing
            </label>
            <textarea
              name="marketingAngles"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-[#1f476e]/40"
              value={form.marketingAngles}
              onChange={handleBasicChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loadingCreate}
            className="px-4 py-2 rounded-lg bg-[#1f476e] text-white text-sm font-semibold hover:bg-[#163553] disabled:opacity-60 transition"
          >
            {loadingCreate ? "Creando..." : "Guardar producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
