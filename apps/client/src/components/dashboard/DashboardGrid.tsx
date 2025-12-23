import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Responsive, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { MetricWidget } from './MetricWidget';
import { ChartWidget } from './ChartWidget';
import { CustomChartWidget } from './CustomChartWidget';
import { Box, DollarSign, TrendingUp, Activity, Target, Video, Globe } from 'lucide-react';

// Fallback for RGL imports
const ResponsiveGrid = (Responsive as any).default || Responsive;

interface DashboardGridProps {
    data: any;
    layout: Layout[];
    customWidgets?: any[];
    onLayoutChange: (layout: Layout[]) => void;
    isEditing?: boolean;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
    data,
    layout,
    customWidgets = [],
    onLayoutChange,
    isEditing = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1200);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDrillDown = (metricId: string) => {
        if (isEditing) return; // Don't navigate while customizing
        navigate(`/admin/analytics/detail/${metricId}`);
    };

    const renderWidget = (id: string) => {
        if (!data) return <div className="p-4 bg-slate-50 animate-pulse rounded-3xl h-full border border-slate-100" />;

        const { summary, distributions } = data;

        switch (id) {
            case 'total_products':
                return (
                    <MetricWidget
                        title="Estado del Catálogo"
                        value={summary.publishedCount || 0}
                        icon={Box}
                        subtitle={`${summary.totalProducts} total`}
                        color="bg-indigo-50 text-indigo-600"
                        onClick={() => handleDrillDown('published')}
                    />
                );
            case 'winner_rate':
                return (
                    <MetricWidget
                        title="Tasa de Éxito"
                        value={`${(summary.winnerRate || 0).toFixed(1)}%`}
                        icon={Target}
                        color="bg-emerald-50 text-indigo-600"
                        subtitle="Ganadores / Analizados total"
                        onClick={() => handleDrillDown('winners')}
                    />
                );
            case 'media_coverage':
                return (
                    <MetricWidget
                        title="Cobertura de Medios"
                        value={`${(summary.mediaCoverage || 0).toFixed(1)}%`}
                        icon={Video}
                        color="bg-purple-50 text-indigo-600"
                        subtitle="Prod. con Videos / Catálogo"
                        onClick={() => handleDrillDown('noMedia')}
                    />
                );
            case 'avg_price':
                return (
                    <MetricWidget
                        title="Precio Promedio"
                        value={`$${(summary.avgSellPrice || 0).toFixed(2)}`}
                        icon={DollarSign}
                        color="bg-blue-50 text-blue-600"
                        subtitle="PVP sugerido"
                        onClick={() => handleDrillDown('all')}
                    />
                );
            case 'cat_dist':
                const catData = Object.entries(distributions.category || {}).map(([name, value]) => ({ name, value }));
                return (
                    <ChartWidget
                        title="Distribución por Categoría"
                        type="bar"
                        data={catData}
                        dataKey="value"
                        colors={['#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81']}
                    />
                );
            case 'country_dist':
                const countryData = Object.entries(distributions.country || {}).map(([name, value]) => ({ name, value }));
                return (
                    <ChartWidget
                        title="Distribución Geográfica"
                        type="bar"
                        data={countryData}
                        dataKey="value"
                        colors={['#10b981', '#059669', '#047857', '#065f46', '#064e3b']}
                        onClick={() => handleDrillDown('byCountry')}
                    />
                );
            case 'verdict_dist':
                const verdictData = Object.entries(distributions.verdict || {}).map(([name, value]) => ({ name, value }));
                return (
                    <ChartWidget
                        title="Análisis de Viabilidad"
                        type="pie"
                        data={verdictData}
                        dataKey="value"
                        colors={['#10b981', '#f59e0b', '#ef4444']}
                        onClick={() => handleDrillDown('byVerdict')}
                    />
                );
            default:
                if (id.startsWith('custom_')) {
                    const config = customWidgets?.find(w => w.id === id);
                    if (config) {
                        return <CustomChartWidget config={config} />;
                    }
                }
                return (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm italic">
                        Widget {id}
                    </div>
                );
        }
    };

    if (!layout || layout.length === 0) return null;

    return (
        <div ref={containerRef} className="w-full min-h-[600px]">
            <ResponsiveGrid
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={145}
                width={width}
                draggableHandle=".drag-handle"
                isDraggable={isEditing}
                isResizable={isEditing}
                margin={[24, 24]}
                onLayoutChange={(currentLayout: Layout[]) => onLayoutChange(currentLayout)}
            >
                {layout.map((item: any) => (
                    <div key={item.i} className="relative group rounded-3xl">
                        {isEditing && (
                            <div className="drag-handle absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl cursor-move opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg border border-slate-200 text-slate-400 hover:text-indigo-600 scale-90 group-hover:scale-100">
                                <Activity size={16} />
                            </div>
                        )}
                        {renderWidget(item.i)}
                    </div>
                ))}
            </ResponsiveGrid>
        </div>
    );
};
