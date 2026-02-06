"use client";

import { useState, useEffect } from 'react';
import { AnalyticsMetrics, AnalyticsCharts } from './AnalyticsWidgets';
import { Loader2 } from "lucide-react";

export default function JobAnalytics({ jobId }: { jobId: string }) {
    const [data, setData] = useState<{ metrics: any[], chartData: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`/api/analytics?jobId=${jobId}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to load job analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [jobId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading job analytics...
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
            <AnalyticsMetrics metrics={data.metrics} />
            <AnalyticsCharts data={data.chartData} />
            <div className="my-8 border-b border-border" />
        </div>
    );
}
