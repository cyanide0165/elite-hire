"use client";

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SourcingChartProps {
    data: { date: string; count: number }[];
}

export default function SourcingChart({ data }: SourcingChartProps) {
    const chartData = useMemo(() => {
        // Fill in missing dates if needed, or simply use provided data
        // For simplicity, we assume data is passed correctly sorted
        return data.map(d => ({
            name: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            value: d.count
        }));
    }, [data]);

    return (
        <div className="glass-card p-6 rounded-2xl h-full animate-fade-up delay-300 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Sourcing Trend</h3>
                <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full text-primary">Last 7 Days</span>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#a1a1aa' }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(23, 23, 23, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
