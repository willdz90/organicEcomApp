import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    COUNTRY_GROUP_OPTIONS,
    type CountryGroup,
} from "../config/productConfig";
import { CategorySelector } from "./CategorySelector";
import {
    Box,
    Trash2,
    MapPin,
    Globe,
    DollarSign,
    Tag,
    Image as ImageIcon,
    Video,
    Link as LinkIcon,
    Plus
} from "lucide-react";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProductFormData {
    title: string;
    description: string;
    category: string;
    countryGroups: CountryGroup[];
    cost: string;
    sellPrice: string;
    supplierUrls: string[];
    socialUrls: string[];
    images: string[];
    whyGood: string;
    filmingApproach: string;
    marketingAngles: string;
    status: ProductStatus;
    ratingAvg: string;
}

interface ProductFormProps {
    initialData?: Partial<ProductFormData>;
    onSubmit: (data: ProductFormData) => void;
    loading: boolean;
    submitLabel: string;
    pageTitle?: string;
    pageSubtitle?: string;
}

export default function ProductForm({
    initialData,
    onSubmit,
    loading,
    submitLabel,
    pageTitle = "Editor de Producto",
    pageSubtitle = "Completa todos los campos requeridos (*)"
}: ProductFormProps) {
    const navigate = useNavigate();

    const [form, setForm] = useState<ProductFormData>({
        title: "",
        description: "",
        category: "",
        countryGroups: ["GENERAL"],
        cost: "",
        sellPrice: "",
        supplierUrls: [],
        socialUrls: [],
        images: [],
        whyGood: "",
        filmingApproach: "",
        marketingAngles: "",
        status: "DRAFT",
        ratingAvg: "",
        ...initialData,
    });

    const [tmpSupplierUrl, setTmpSupplierUrl] = useState("");
    const [tmpSocialUrl, setTmpSocialUrl] = useState("");
    const [tmpImageUrl, setTmpImageUrl] = useState("");

    useEffect(() => {
        if (initialData) {
            setForm(prev => ({
                ...prev,
                ...initialData,
                // Ensure arrays are never null/undefined if API returns them as such
                countryGroups: initialData.countryGroups || ["GENERAL"],
                supplierUrls: initialData.supplierUrls || [],
                socialUrls: initialData.socialUrls || [],
                images: initialData.images || [],
                sellPrice: initialData.sellPrice != null ? String(initialData.sellPrice) : "",
                cost: initialData.cost != null ? String(initialData.cost) : "",
                ratingAvg: initialData.ratingAvg != null ? String(initialData.ratingAvg) : "",
            }));
        }
    }, [initialData]);

    const handleBasicChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleCountryGroup = (group: CountryGroup) => {
        setForm((prev) => {
            const exists = prev.countryGroups.includes(group);
            if (exists) {
                const next = prev.countryGroups.filter((g) => g !== group);
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

    const addUrl = (field: "supplierUrls" | "socialUrls" | "images", value: string, resetFn: (v: string) => void) => {
        const val = value.trim();
        if (!val) return;
        setForm((prev) => {
            if (prev[field].includes(val)) return prev;
            return { ...prev, [field]: [...prev[field], val] };
        });
        resetFn("");
    };

    const removeUrl = (field: "supplierUrls" | "socialUrls" | "images", url: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((u) => u !== url),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            form.supplierUrls.length === 0 ||
            form.socialUrls.length === 0 ||
            form.images.length === 0
        ) {
            alert("Añade al menos 1 URL de proveedor, 1 URL de contenido y 1 URL de imagen.");
            return;
        }
        onSubmit(form);
    };

    // --- Components for cleaner UI ---

    const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Icon size={18} />
            </div>
            <div>
                <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                {subtitle && <p className="textxs text-slate-500">{subtitle}</p>}
            </div>
        </div>
    );

    const UrlList = ({ urls, onRemove }: { urls: string[], onRemove: (u: string) => void }) => (
        <div className="mt-3 space-y-2">
            {urls.length === 0 && <p className="text-xs text-slate-400 italic pl-1">No hay enlaces añadidos</p>}
            {urls.map(url => (
                <div key={url} className="flex items-center justify-between group p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="truncate flex-1 text-slate-600 font-mono">{url}</span>
                    <button type="button" onClick={() => onRemove(url)} className="p-1 text-slate-400 hover:text-red-500 transition">
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-20">

            {/* Top Actions */}
            <div className="flex items-center justify-between sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm py-4 border-b border-indigo-100 hidden md:flex transition-all">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{pageTitle}</h2>
                    <p className="text-xs text-slate-500">{pageSubtitle}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/products")}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
                    >
                        Descartar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 transition-all flex items-center gap-2"
                    >
                        {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
                        {submitLabel}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT COLUMN (2/3) */}
                <div className="md:col-span-2 space-y-6">

                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <SectionTitle icon={Box} title="Información General" />

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5 ml-1">Título del producto *</label>
                                <input
                                    name="title"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                    placeholder="Ej: Proyector Portátil HD..."
                                    value={form.title}
                                    onChange={handleBasicChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5 ml-1">Descripción</label>
                                <textarea
                                    name="description"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400"
                                    placeholder="Describe las características principales..."
                                    value={form.description}
                                    onChange={handleBasicChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Marketing Analysis Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <SectionTitle icon={Video} title="Análisis de Marketing" />

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5 ml-1">Why Good (Por qué vende?)</label>
                                <textarea
                                    name="whyGood"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                    value={form.whyGood}
                                    onChange={handleBasicChange}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5 ml-1">Enfoque de Filmación</label>
                                    <textarea
                                        name="filmingApproach"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                        value={form.filmingApproach}
                                        onChange={handleBasicChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5 ml-1">Ángulos de Marketing</label>
                                    <textarea
                                        name="marketingAngles"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                        value={form.marketingAngles}
                                        onChange={handleBasicChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Links Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <SectionTitle icon={LinkIcon} title="Recursos y Enlaces" />

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Supplier */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-700 ml-1">Proveedor (Aliexpress/Temu)</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="Pegar URL..."
                                        value={tmpSupplierUrl}
                                        onChange={(e) => setTmpSupplierUrl(e.target.value)}
                                    />
                                    <button type="button" onClick={() => addUrl("supplierUrls", tmpSupplierUrl, setTmpSupplierUrl)} className="shrink-0 p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-all">
                                        <Plus size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <UrlList urls={form.supplierUrls} onRemove={(u) => removeUrl("supplierUrls", u)} />
                            </div>

                            {/* Social */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-700 ml-1">Contenido (TikTok/Reels)</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="Pegar URL..."
                                        value={tmpSocialUrl}
                                        onChange={(e) => setTmpSocialUrl(e.target.value)}
                                    />
                                    <button type="button" onClick={() => addUrl("socialUrls", tmpSocialUrl, setTmpSocialUrl)} className="shrink-0 p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-all">
                                        <Plus size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <UrlList urls={form.socialUrls} onRemove={(u) => removeUrl("socialUrls", u)} />
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-700 ml-1">Imágenes (Direct Link)</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="Pegar URL..."
                                        value={tmpImageUrl}
                                        onChange={(e) => setTmpImageUrl(e.target.value)}
                                    />
                                    <button type="button" onClick={() => addUrl("images", tmpImageUrl, setTmpImageUrl)} className="shrink-0 p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-all">
                                        <Plus size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <UrlList urls={form.images} onRemove={(u) => removeUrl("images", u)} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (1/3) */}
                <div className="space-y-6">

                    {/* Status & Category */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
                        <SectionTitle icon={Tag} title="Organización" />

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5 ml-1">Estado</label>
                            <select
                                name="status"
                                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={form.status}
                                onChange={handleBasicChange}
                            >
                                <option value="DRAFT">Draft (Oculto)</option>
                                <option value="PUBLISHED">Publicado</option>
                                <option value="ARCHIVED">Archivado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5 ml-1">Categoría *</label>
                            <CategorySelector
                                value={form.category}
                                onChange={(slug) => setForm(prev => ({ ...prev, category: slug }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
                        <SectionTitle icon={DollarSign} title="Precios y Costos" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1 ml-1">Coste</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number" step="0.01" name="cost"
                                        className="w-full pl-6 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.cost} onChange={handleBasicChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1 ml-1">Venta</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number" step="0.01" name="sellPrice"
                                        className="w-full pl-6 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.sellPrice} onChange={handleBasicChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <label className="block text-xs font-medium text-slate-700 mb-2 ml-1">Rating Inicial</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number" step="0.1" max="5" name="ratingAvg"
                                    className="w-20 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-center"
                                    value={form.ratingAvg} onChange={handleBasicChange} placeholder="4.5"
                                />
                                <span className="text-xs text-slate-400">/ 5.0</span>
                            </div>
                        </div>
                    </div>

                    {/* Geo Targeting */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <SectionTitle icon={Globe} title="Segmentación Geo" />

                        <div className="flex flex-wrap gap-2">
                            {COUNTRY_GROUP_OPTIONS.map((opt) => {
                                const active = form.countryGroups.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => toggleCountryGroup(opt)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

            </div>

            <div className="md:hidden flex flex-col gap-3 pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition"
                >
                    {loading ? "Guardando..." : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/admin/products")}
                    className="w-full px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                >
                    Descartar cambios
                </button>
            </div>

        </form>
    );
}
