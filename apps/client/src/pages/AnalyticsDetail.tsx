import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import { ArrowLeft, ExternalLink, Box, Tag, Package, Target, Video } from "lucide-react";

interface DetailItem {
    id: string;
    title: string;
    status?: string;
    price?: number;
    category?: string;
}

export function AnalyticsDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<DetailItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");

    const getTitle = (id: string | undefined) => {
        switch (id) {
            case 'winners': return 'Productos Ganadores (Winners)';
            case 'noMedia': return 'Productos sin Contenido Multimedia';
            case 'published': return 'Catálogo Publicado';
            case 'all': return 'Inventario Completo';
            case 'byCountry': return 'Distribución por País';
            case 'byVerdict': return 'Distribución por Veredicto';
            case 'byCategory': return 'Distribución por Categoría';
            default: return id ? `Detalle: ${id}` : 'Detalle de Métricas';
        }
    };

    const loadDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get("/analytics/stats");
            const drillDown = res.data.drillDown;

            if (id && drillDown) {
                let rawData = drillDown[id];

                // Improved flattening for grouped data: keep track of what segment each item belongs to
                if (rawData && !Array.isArray(rawData)) {
                    // It's a key-value object (segment -> products[])
                    const flattened: DetailItem[] = [];
                    Object.entries(rawData as Record<string, any[]>).forEach(([segment, items]) => {
                        items.forEach(item => {
                            flattened.push({
                                ...item,
                                category: segment // Re-purpose category field for the segment name (Country/Verdict)
                            });
                        });
                    });
                    rawData = flattened;
                }

                // Handling specific sub-paths like cat_... or country_...
                if (id.startsWith('cat_')) {
                    const catName = id.replace('cat_', '');
                    rawData = drillDown.byCategory?.[catName] || [];
                    setTitle(`Categoría: ${catName}`);
                } else if (id.startsWith('country_')) {
                    const countryName = id.replace('country_', '');
                    rawData = drillDown.byCountry?.[countryName] || [];
                    setTitle(`País/Grupo: ${countryName}`);
                } else {
                    setTitle(getTitle(id));
                }

                // Deduplicate and ensure array structure
                const dataArray = Array.isArray(rawData) ? rawData : [];
                setData(dataArray as DetailItem[]);
            }
        } catch (err) {
            console.error("Error loading analytics detail", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {data.length} productos encontrados en este segmento.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Segmento</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.map((item, idx) => (
                                <tr key={`${item.id}-${idx}`} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <Package size={16} />
                                            </div>
                                            <span className="font-semibold text-slate-700">{item.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' :
                                            item.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {item.category || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-bold">
                                        {item.price ? `$${Number(item.price).toFixed(2)}` : '$0.00'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/products/${item.id}/edit`)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            Editar
                                            <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                                        No se encontraron productos en esta sección.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
