import React from 'react';
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    color?: string; // Tailwind color class for icon bg, e.g., "bg-indigo-500"
    delay?: number;
}

export default function MetricCard({ title, value, trend, trendUp, icon: Icon, color = "bg-primary", delay = 0 }: MetricCardProps) {
    return (
        <div
            className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 animate-fade-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl bg-opacity-20 flex items-center justify-center", color.replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-'))}>
                    <div className={cn("absolute inset-0 opacity-20", color)}></div>
                    <Icon className={cn("w-6 h-6 relative z-10", color.replace('bg-', 'text-'))} />
                </div>
                {trend && (
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full border",
                        trendUp
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                        {trend}
                    </span>
                )}
            </div>

            <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
            <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>

            {/* Background Glow Effect */}
            <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity", color)} />
        </div>
    );
}
