"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface SourcingAnalyticsProps {
    skillDistribution: { name: string; value: number }[];
    statusDistribution: { name: string; value: number }[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

export default function SourcingAnalyticsCharts({ skillDistribution, statusDistribution }: SourcingAnalyticsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[400px]">
            {/* Top Skills Chart */}
            <div className="glass-card p-6 rounded-2xl flex flex-col">
                <h3 className="text-lg font-semibold mb-6">Top Sourced Skills</h3>
                <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={skillDistribution} layout="vertical" margin={{ left: 40 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#a1a1aa"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(23, 23, 23, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {skillDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Distribution */}
            <div className="glass-card p-6 rounded-2xl flex flex-col">
                <h3 className="text-lg font-semibold mb-6">Pipeline Status</h3>
                <div className="flex-1 w-full min-h-[200px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(23, 23, 23, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="absolute flex flex-col gap-2 pointer-events-none">
                        <div className="text-center">
                            <span className="text-2xl font-bold">{statusDistribution.reduce((acc, curr) => acc + curr.value, 0)}</span>
                            <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
