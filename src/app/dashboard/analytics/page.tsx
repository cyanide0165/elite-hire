"use client";

import { AnalyticsCharts, AnalyticsMetrics } from "@/components/dashboard/AnalyticsWidgets";
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
    const [data, setData] = useState<{ metrics: any[], chartData: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics');
                if (res.ok) {
                    const json = await res.json();
                    console.log("Analytics Data:", json);
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8">Loading analytics...</div>;
    if (!data) return <div className="p-8">Failed to load analytics.</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
                <p className="text-muted-foreground">Insights into your recruitment pipeline performance (Last 7 Days).</p>
            </div>

            <AnalyticsMetrics metrics={data.metrics} />
            <AnalyticsCharts data={data.chartData} />
        </div>
    );
}
