import React, { useState, useEffect } from 'react';
import { ChartWidget } from './ChartWidget';
import { api } from '../../api/apiClient';

interface CustomChartWidgetProps {
    config: {
        id: string;
        title: string;
        dimension: string;
        metric: string;
        chartType: 'bar' | 'pie';
        filters: any;
    };
}

export const CustomChartWidget: React.FC<CustomChartWidgetProps> = ({ config }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await api.post('/analytics/custom', config);
            setData(res.data);
        } catch (err) {
            console.error("Error loading custom widget data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [JSON.stringify(config)]);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-full animate-pulse">
                <div className="h-4 w-1/2 bg-slate-100 rounded-full mb-8"></div>
                <div className="flex-1 bg-slate-50 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <ChartWidget
            title={config.title}
            type={config.chartType}
            data={data}
            dataKey="value"
            colors={config.chartType === 'pie' ? ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'] : ['#6366f1']}
        />
    );
};
