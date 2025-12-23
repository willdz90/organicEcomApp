// src/pages/ProductDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import { ArrowLeft, ExternalLink, Play, ShoppingBag, ChevronDown, MonitorPlay, Zap, Target, Globe, Star } from "lucide-react";

interface ProductDetail {
    id: string;
    title: string;
    description?: string;
    sellPrice?: string | number;
    cost?: string | number;
    marginPct?: string | number;
    images?: string[];
    status: string;
    ratingAvg?: string | number;
    supplierUrls?: string[];
    socialUrls?: string[];
    whyGood?: string;
    filmingApproach?: string;
    marketingAngles?: string;
    countryGroups?: string[];
    category?: { name: string };
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // State genérico para el modal de contenido (Título + Texto)
    const [modalData, setModalData] = useState<{ title: string, content: string } | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.get(`/products/${id}`)
            .then((res) => {
                setProduct(res.data);
                if (res.data.images && res.data.images.length > 0) {
                    setSelectedImage(res.data.images[0]);
                }
            })
            .catch((err) => {
                console.error("Error loading product", err);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando detalles...</div>;
    }

    if (!product) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-slate-700">Producto no encontrado</h2>
                <button onClick={() => navigate("/marketplace")} className="mt-4 text-[#1f476e] font-medium hover:underline">
                    Volver al Marketplace
                </button>
            </div>
        );
    }

    const images = product.images || [];

    return (
        <div className="max-w-7xl mx-auto pb-10 px-4 md:px-8 relative">

            {/* --- GENERIC MODAL --- */}
            {modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 transform">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{modalData.title}</h3>
                            <button
                                onClick={() => setModalData(null)}
                                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {/* Content Modal */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line">
                                {modalData.content}
                            </p>
                        </div>
                        {/* Footer Modal */}
                        <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setModalData(null)}
                                className="px-4 py-2 bg-[#1f476e] text-white text-sm font-medium rounded-lg hover:bg-[#163553] transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                    {/* Click outside to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setModalData(null)} />
                </div>
            )}

            {/* HEADER NAV */}
            <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-sm text-slate-500 hover:text-[#1f476e] mb-6 transition-colors font-medium"
            >
                <div className="bg-white p-1.5 rounded-full border border-slate-200 group-hover:border-[#1f476e] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <span>Volver al listado</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                {/* --- LEFT: GALLERY (Sticky) --- */}
                <div className="lg:col-span-6 lg:sticky lg:top-8 space-y-4">
                    <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt={product.title}
                                className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 font-medium">
                                Sin imagen
                            </div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white ${selectedImage === img
                                        ? "border-[#1f476e] shadow-md ring-2 ring-[#1f476e]/10 scale-105"
                                        : "border-slate-100 opacity-70 hover:opacity-100 hover:border-slate-300"
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-contain p-1 mix-blend-multiply" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- RIGHT: INFO (Scrollable Content) --- */}
                <div className="lg:col-span-6 space-y-8">

                    {/* Title & Badge Header */}
                    <div className="space-y-3 border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {product.status === 'PUBLISHED' ? 'Publicado' : product.status}
                            </span>
                            {product.category?.name && (
                                <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                                    {product.category.name}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-3">
                            <StarRating rating={Number(product.ratingAvg || 0)} />
                            <span className="text-sm font-bold text-slate-700 mt-0.5">{Number(product.ratingAvg || 0).toFixed(1)}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-sm text-slate-500">Valoración Global</span>
                        </div>
                    </div>

                    {/* KEY METRICS CARD */}
                    <div className="grid grid-cols-3 gap-0 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-x divide-slate-200">
                        <div className="p-4 flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Costo</span>
                            <span className="text-xl font-bold text-slate-700 font-mono tracking-tight">${Number(product.cost || 0).toFixed(2)}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center bg-white shadow-sm z-10 scale-105 border-x border-slate-200">
                            <span className="text-[10px] font-bold text-[#1f476e]/70 uppercase tracking-widest mb-1">Venta</span>
                            <span className="text-2xl font-black text-[#1f476e] font-mono tracking-tight">${Number(product.sellPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center hover:bg-white transition-colors">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Margen</span>
                            <span className="text-xl font-bold text-emerald-600 font-mono tracking-tight">{Number(product.marginPct || 0).toFixed(0)}%</span>
                        </div>
                    </div>

                    {/* TARGET MARKETS */}
                    {product.countryGroups && product.countryGroups.length > 0 && (
                        <div className="flex items-start gap-4 py-2 px-1">
                            <div className="mt-0.5 p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
                                <Globe className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                                    Países Objetivo
                                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-medium tracking-normal">{product.countryGroups.length}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.countryGroups.map((code, i) => (
                                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default select-none">
                                            {code.length === 2 ? (
                                                <span className="mr-1.5 text-base leading-none">{getFlagEmoji(code)}</span>
                                            ) : (
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                                            )}
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DESCRIPTION BOX */}
                    {product.description && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Descripción</h3>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                </div>
                            </div>
                            <div className="p-5 relative">
                                <div className="max-h-[120px] overflow-hidden text-sm leading-relaxed text-slate-600">
                                    <p className="whitespace-pre-line">{product.description}</p>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

                                <button
                                    onClick={() => setModalData({ title: "Descripción del Producto", content: product.description! })}
                                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-4 py-1.5 rounded-full text-xs font-bold text-[#1f476e] hover:bg-slate-50 hover:scale-105 transition-all"
                                >
                                    Leer todo <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ANALYSIS GRID (Translated & Modal Enabled) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estrategia & Ángulos</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <AnalysisCard
                                title="¿Por qué funciona?"
                                content={product.whyGood}
                                icon={<Zap className="w-4 h-4 fill-current" />}
                                colorTheme="blue"
                                onExpand={() => setModalData({ title: "¿Por qué funciona? (Why Good)", content: product.whyGood! })}
                            />

                            <AnalysisCard
                                title="Ángulos de Marketing"
                                content={product.marketingAngles}
                                icon={<Target className="w-4 h-4 fill-current" />}
                                colorTheme="purple"
                                onExpand={() => setModalData({ title: "Ángulos de Marketing", content: product.marketingAngles! })}
                            />
                        </div>

                        {product.filmingApproach && (
                            <AnalysisCard
                                title="Enfoque de Grabación"
                                content={product.filmingApproach}
                                icon={<MonitorPlay className="w-4 h-4 fill-current" />}
                                colorTheme="orange"
                                onExpand={() => setModalData({ title: "Enfoque de Grabación", content: product.filmingApproach! })}
                                fullWidth
                            />
                        )}
                    </div>

                    {/* LINKS */}
                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Enlaces de Recursos</h3>

                        <div className="flex flex-col gap-4">
                            {/* Proveedores */}
                            <div className="flex flex-wrap gap-2">
                                {product.supplierUrls?.map((url, i) => (
                                    <ResourceButton key={i} url={url} type="supplier" />
                                ))}
                            </div>

                            {/* Contenido */}
                            {product.socialUrls && product.socialUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {product.socialUrls.map((url, i) => (
                                        <ResourceButton key={i} url={url} type="social" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Componente Tarjeta de Análisis Reutilizable
function AnalysisCard({
    title,
    content,
    icon,
    colorTheme,
    onExpand,
    fullWidth = false
}: {
    title: string;
    content?: string;
    icon: React.ReactNode;
    colorTheme: 'blue' | 'purple' | 'orange';
    onExpand: () => void;
    fullWidth?: boolean;
}) {
    if (!content) return null;

    const styles = {
        blue: { bg: "from-blue-50 to-white", border: "border-blue-100 hover:border-blue-300", title: "text-blue-900", iconBg: "bg-blue-200" },
        purple: { bg: "from-purple-50 to-white", border: "border-purple-100 hover:border-purple-300", title: "text-purple-900", iconBg: "bg-purple-200" },
        orange: { bg: "from-orange-50 to-white", border: "border-orange-100 hover:border-orange-300", title: "text-orange-900", iconBg: "bg-orange-200" },
    }[colorTheme];

    // Determine if content is long enough to need "Look More"
    const isLong = content.length > 120; // Umbral arbitrario para mostrar botón

    return (
        <div className={`group bg-gradient-to-br ${styles.bg} p-5 rounded-2xl border ${styles.border} hover:shadow-md transition-all relative ${fullWidth ? '' : ''}`}>
            <h4 className={`flex items-center gap-2 text-xs font-black ${styles.title} uppercase tracking-wide mb-3`}>
                <span className={`${styles.iconBg} w-6 h-6 rounded-full flex items-center justify-center text-[10px]`}>
                    {icon}
                </span>
                {title}
            </h4>

            <div className={`relative ${isLong ? 'max-h-[80px] overflow-hidden' : ''}`}>
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {content}
                </p>
                {isLong && (
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
            </div>

            {isLong && (
                <button
                    onClick={onExpand}
                    className="mt-2 text-[10px] font-bold text-[#1f476e] flex items-center gap-1 hover:underline uppercase tracking-wide"
                >
                    Leer todo <ChevronDown className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}

// Sub-componente para botones de recursos aesthetic
function ResourceButton({ url, type }: { url: string, type: 'supplier' | 'social' }) {
    let label = "Enlace Web";
    let styleClass = "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300";
    let icon = <ExternalLink className="w-3 h-3" />;

    const u = url.toLowerCase();

    if (type === 'supplier') {
        if (u.includes("aliexpress")) { label = "AliExpress"; styleClass = "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"; icon = <ShoppingBag className="w-3 h-3" /> }
        else if (u.includes("amazon")) { label = "Amazon"; styleClass = "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100"; icon = <ShoppingBag className="w-3 h-3" /> }
        else if (u.includes("alibaba")) { label = "Alibaba"; styleClass = "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"; icon = <ShoppingBag className="w-3 h-3" /> }
        else if (u.includes("cj")) { label = "CJ Dropshipping"; styleClass = "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"; icon = <ShoppingBag className="w-3 h-3" /> }
    } else {
        if (u.includes("tiktok")) { label = "TikTok Creative"; styleClass = "bg-black text-white border-black hover:opacity-80"; icon = <Play className="w-3 h-3 fill-current" /> }
        else if (u.includes("instagram")) { label = "Instagram"; styleClass = "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent hover:opacity-90 shadow-sm"; icon = <Play className="w-3 h-3 fill-current" /> }
        else if (u.includes("facebook")) { label = "Facebook Ads"; styleClass = "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"; icon = <Play className="w-3 h-3 fill-current" /> }
        else if (u.includes("youtube")) { label = "YouTube"; styleClass = "bg-red-600 text-white border-red-600 hover:bg-red-700"; icon = <Play className="w-3 h-3 fill-current" /> }
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all transform hover:-translate-y-0.5 ${styleClass}`}
        >
            {icon}
            {label}
            <ExternalLink className="w-3 h-3 opacity-50 ml-1" />
        </a>
    )
}

// Helper para banderas
function getFlagEmoji(countryCode: string) {
    if (!countryCode) return "";
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// Componente de estrellas dinámicas
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="relative inline-flex gap-0.5">
            {/* Base (Estrellas vacías) */}
            <div className="flex gap-0.5 text-slate-200">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                ))}
            </div>
            {/* Overlay (Estrellas llenas) recortadas */}
            <div
                className="absolute top-0 left-0 flex gap-0.5 text-amber-400 overflow-hidden"
                style={{ width: `${(rating / 5) * 100}%` }}
            >
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                ))}
            </div>
        </div>
    );
}
