import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricWidgetProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
    onClick?: () => void;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'bg-indigo-50 text-indigo-600',
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden group ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.98]' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${color}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}
                    >
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>

            <div className="mt-auto">
                <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
                {subtitle && <p className="text-xs text-slate-700 mt-1.5 font-semibold">{subtitle}</p>}
            </div>

            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 group-hover:scale-110 transition-transform">
                <Icon size={80} />
            </div>
        </div>
    );
};
