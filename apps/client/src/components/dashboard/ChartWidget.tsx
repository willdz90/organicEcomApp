import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';

interface ChartWidgetProps {
    title: string;
    type: 'bar' | 'line' | 'pie';
    data: any[];
    dataKey: string;
    nameKey?: string;
    colors?: string[];
    onClick?: () => void;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
    title,
    type,
    data,
    dataKey,
    nameKey = 'name',
    colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    onClick
}) => {
    const renderChart = () => {
        if (type === 'bar') {
            return (
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey={nameKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey={dataKey} fill={colors[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
            );
        }

        if (type === 'pie') {
            return (
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey={dataKey}
                        nameKey={nameKey}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                </PieChart>
            );
        }

        return null;
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden outline-none ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.98] group' : ''}`}
        >
            <h3 className="text-sm font-semibold text-slate-800 mb-6">{title}</h3>
            <div className="flex-1 w-full min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={180} minWidth={100}>
                    {renderChart() as any}
                </ResponsiveContainer>
            </div>
        </div>
    );
};
