"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ChartConfig = { width: "100%", height: "100%", theme: "vs-dark", stroke: "hsl(var(--muted-foreground))", fill: "hsl(var(--primary))" };

export function AnalyticsCharts({ data }: { data: any[] }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            <div className="glass-card p-6 rounded-xl border border-border h-[400px]">
                <h3 className="text-lg font-bold mb-6">Application Volume</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke={ChartConfig.stroke} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={ChartConfig.stroke} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                        <Bar dataKey="applicants" fill={ChartConfig.fill} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="glass-card p-6 rounded-xl border border-border h-[400px]">
                <h3 className="text-lg font-bold mb-6">Hiring Velocity</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke={ChartConfig.stroke} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={ChartConfig.stroke} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                        <Line type="monotone" dataKey="hires" stroke="hsl(262 83% 58%)" strokeWidth={2} dot={{ fill: 'hsl(262 83% 58%)' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function AnalyticsMetrics({ metrics }: { metrics: any[] }) {
    if (!metrics) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {metrics.map((m: any) => (
                <div key={m.title} className="glass-card p-6 rounded-xl border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{m.title}</h3>
                    <div className="text-3xl font-bold">{m.value}</div>
                    <div className="text-green-500 text-sm mt-1">{m.change}</div>
                </div>
            ))}
        </div>
    );
}
