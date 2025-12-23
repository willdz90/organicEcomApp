import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface DrillDownItem {
    id: string;
    title: string;
    status?: string;
    [key: string]: any;
}

interface DashboardDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: DrillDownItem[];
    type: string;
}

export const DashboardDetailModal: React.FC<DashboardDetailModalProps> = ({
    isOpen,
    onClose,
    title,
    data,
    type
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {data.length} {data.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {data.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400">No hay datos disponibles para esta métrica.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {data.map((item) => (
                                    <div key={item.id} className="py-4 flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 line-clamp-1">{item.title}</span>
                                            {item.status && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1 ${item.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' :
                                                        item.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
                                        <a
                                            href={`/admin/products/${item.id}`}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm font-medium"
                                        >
                                            Ver detalle
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
