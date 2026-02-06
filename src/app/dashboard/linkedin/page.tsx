import prisma from "@/backhand/lib/db";
import SourcingChart from "@/components/dashboard/SourcingChart";
import SourcingAnalyticsCharts from "@/components/dashboard/SourcingAnalyticsCharts";
import { Zap, Briefcase, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LinkedInSourcingPage() {
    // Fetch Sourced Candidates (Last 30 days for trend)
    const sourcedCandidates = await prisma.candidate.findMany({
        where: { linkedinId: { not: null } },
        orderBy: { createdAt: "desc" },
        include: {
            job: { select: { title: true, id: true } }
        }
    });

    // 1. Trend Data (Daily)
    const trendMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        trendMap.set(d.toISOString().split('T')[0], 0);
    }
    sourcedCandidates.forEach(c => {
        const dateKey = c.createdAt.toISOString().split('T')[0];
        if (trendMap.has(dateKey)) {
            trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
        }
    });
    const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));

    // 2. Skill Distribution
    const skillCounts: Record<string, number> = {};
    sourcedCandidates.forEach(c => {
        if (c.skills) {
            c.skills.split(',').forEach(s => {
                const skill = s.trim();
                if (skill) skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        }
    });
    const skillDistribution = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

    // 3. Status Distribution
    const statusCounts: Record<string, number> = {};
    sourcedCandidates.forEach(c => {
        const status = c.status.replace('_', ' ');
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const statusDistribution = Object.entries(statusCounts)
        .map(([name, value]) => ({ name, value }));

    // Stats
    const totalSourced = sourcedCandidates.length;
    const sourcesJobsCount = new Set(sourcedCandidates.map(c => c.jobId)).size;

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-purple-500" />
                    LinkedIn Sourcing Hub
                </h1>
                <p className="text-muted-foreground text-lg">
                    Monitor sourcing velocity and candidate quality metrics.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Total Sourced</p>
                        <h3 className="text-3xl font-bold text-foreground mt-1">{totalSourced}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-purple-500" />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Active Campaigns</p>
                        <h3 className="text-3xl font-bold text-foreground mt-1">{sourcesJobsCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 flex flex-col justify-center gap-2">
                    <h4 className="font-semibold text-foreground">Start New Search</h4>
                    <p className="text-xs text-muted-foreground">Go to a Job Workspace to launch the LinkedIn Sourcing tool.</p>
                    <Link href="/dashboard/jobs" className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline group">
                        View Jobs <ExternalLink className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>

            {/* Charts Area 1: Trend */}
            <div className="h-[300px]">
                <SourcingChart data={trendData} />
            </div>

            {/* Charts Area 2: Skills & Status */}
            <div className="flex-1 min-h-[300px]">
                <SourcingAnalyticsCharts
                    skillDistribution={skillDistribution}
                    statusDistribution={statusDistribution}
                />
            </div>
        </div>
    );
}
