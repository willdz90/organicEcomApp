import React, { useState } from 'react';
import { X, BarChart3, PieChart as PieChartIcon, Settings2, Plus, Filter } from 'lucide-react';
import { api } from '../../api/apiClient';

interface ReportBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (widgetConfig: any) => void;
}

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({
    isOpen,
    onClose,
    onSave
}) => {
    const [config, setConfig] = useState({
        title: '',
        dimension: 'category',
        metric: 'count',
        chartType: 'bar',
        filters: {
            minRating: 0,
            status: ''
        }
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!config.title) return;
        setLoading(true);
        try {
            // Test the query first to ensure it's valid
            await api.post('/analytics/custom', config);
            onSave({
                ...config,
                id: `custom_${Date.now()}`
            });
            onClose();
        } catch (err) {
            console.error("Error creating report", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Crear Nuevo Reporte</h2>
                        <p className="text-sm text-slate-500 mt-1">Configura tu gráfica personalizada</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Título */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Plus size={16} /> Título del Gráfico
                        </label>
                        <input
                            type="text"
                            value={config.title}
                            onChange={e => setConfig({ ...config, title: e.target.value })}
                            placeholder="Ej: Productos Top por País"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Dimensión */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700">Dimensión (Eje X)</label>
                            <select
                                value={config.dimension}
                                onChange={e => setConfig({ ...config, dimension: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                            >
                                <option value="category">Categoría</option>
                                <option value="country">País</option>
                                <option value="status">Estado</option>
                            </select>
                        </div>

                        {/* Métrica */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700">Métrica (Eje Y)</label>
                            <select
                                value={config.metric}
                                onChange={e => setConfig({ ...config, metric: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                            >
                                <option value="count">Cantidad de Productos</option>
                                <option value="avgPrice">Precio Promedio</option>
                                <option value="avgRating">Rating Promedio</option>
                            </select>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Filter size={16} /> Filtros adicionales
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <span className="text-xs text-slate-400 block mb-1">Rating Mínimo</span>
                                <input
                                    type="number"
                                    min="0" max="5" step="0.5"
                                    value={config.filters.minRating}
                                    onChange={e => setConfig({ ...config, filters: { ...config.filters, minRating: Number(e.target.value) } })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs text-slate-400 block mb-1">Cualquier Estado</span>
                                <select
                                    value={config.filters.status}
                                    onChange={e => setConfig({ ...config, filters: { ...config.filters, status: e.target.value } })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                >
                                    <option value="">Cualquiera</option>
                                    <option value="PUBLISHED">Publicado</option>
                                    <option value="DRAFT">Borrador</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Visualización */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Settings2 size={16} /> Tipo de Visualización
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfig({ ...config, chartType: 'bar' })}
                                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${config.chartType === 'bar' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                            >
                                <BarChart3 size={24} />
                                <span className="text-xs font-bold">Gráfico de Barras</span>
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, chartType: 'pie' })}
                                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${config.chartType === 'pie' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                            >
                                <PieChartIcon size={24} />
                                <span className="text-xs font-bold">Gráfico Circular</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50/50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !config.title}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        Crear Gráfico
                    </button>
                </div>
            </div>
        </div>
    );
};
