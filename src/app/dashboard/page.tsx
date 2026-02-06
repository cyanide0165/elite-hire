import Link from "next/link";
import prisma from "@/backhand/lib/db";
import CandidateList from "@/components/dashboard/CandidateList";
import MetricCard from "@/components/dashboard/MetricCard";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import DashboardCandidateTabs from "@/components/dashboard/DashboardCandidateTabs";
import { Briefcase, Users, CheckCircle2, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const [
        totalCandidates,
        activeJobs,
        shortlistedCandidates,
        sourcedCandidates,
        recentCandidates,
        sourcingTrend
    ] = await Promise.all([
        prisma.candidate.count(),
        prisma.job.count(),
        prisma.candidate.count({ where: { status: "SHORTLISTED" } }),
        prisma.candidate.count({ where: { linkedinId: { not: null } } }),
        prisma.candidate.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { _count: { select: { proctorLogs: true } } },
        }),
        // Fetch last 7 days sourced candidates for chart
        prisma.candidate.findMany({
            where: {
                linkedinId: { not: null },
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            select: { createdAt: true }
        })
    ]);

    // Aggregate Trend Data
    const trendMap = new Map<string, number>();
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        trendMap.set(d.toISOString().split('T')[0], 0);
    }

    sourcingTrend.forEach(c => {
        const dateKey = c.createdAt.toISOString().split('T')[0];
        if (trendMap.has(dateKey)) {
            trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
        }
    });

    const chartData = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));

    // Sanitize candidates
    const sanitizedCandidates = recentCandidates.map(c => ({
        ...c,
        resumeData: null
    }));

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-bold tracking-tight mb-2">
                    Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Alex</span>
                </h2>
                <p className="text-muted-foreground text-lg">Here's what's happening with your hiring pipeline today.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Active Jobs"
                    value={activeJobs}
                    trend="+2 this week"
                    trendUp={true}
                    icon={Briefcase}
                    color="bg-blue-500"
                    delay={0}
                />
                <MetricCard
                    title="Total Candidates"
                    value={totalCandidates}
                    trend="+12% vs last month"
                    trendUp={true}
                    icon={Users}
                    color="bg-indigo-500"
                    delay={100}
                />
                <MetricCard
                    title="Sourced via LinkedIn"
                    value={sourcedCandidates}
                    trend="Automated"
                    trendUp={true}
                    icon={Zap}
                    color="bg-purple-500"
                    delay={200}
                />
                <MetricCard
                    title="Shortlisted"
                    value={shortlistedCandidates}
                    trend="High Quality"
                    trendUp={true}
                    icon={CheckCircle2}
                    color="bg-green-500"
                    delay={300}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 lg:grid-cols-7 h-[600px]">
                {/* Recent Candidates List (Left) */}
                <div className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Recent Candidates</h3>
                        <Link href="/dashboard/candidates" className="text-sm font-medium text-primary hover:underline">View All &rarr;</Link>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <CandidateList candidates={sanitizedCandidates} />
                    </div>
                </div>

                {/* Activity Timeline (Right) */}
                <div className="lg:col-span-2">
                    <ActivityTimeline />
                </div>
            </div>
        </div>
    );
}
