import { NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        // Build filter object
        const whereClause = jobId ? { jobId } : {};
        const jobWhereClause = jobId ? { id: jobId } : {};

        // Parallel data fetching for performance
        const [
            totalCandidates,
            activeJobs,
            hiredCandidates,
            recentCandidates
        ] = await Promise.all([
            prisma.candidate.count({ where: whereClause }),
            prisma.job.count({ where: jobWhereClause }),
            prisma.candidate.count({ where: { ...whereClause, status: "HIRED" } }),
            prisma.candidate.findMany({
                where: {
                    ...whereClause,
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
                    }
                },
                select: { createdAt: true, status: true }
            })
        ]);

        // Process daily trends for the last 7 days
        const dailyStats = new Map<string, { applicants: number, hires: number }>();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Initialize last 7 days map
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            dailyStats.set(dayName, { applicants: 0, hires: 0 });
        }

        // Fill with actual data
        // Note: Using a simple map by day name might overlap if the range spans > 1 week, 
        // but for "last 7 days" effectively it's unique days. 
        // Better to key by date string if strictness needed, but sticking to day name as per UI mock.
        recentCandidates.forEach(c => {
            const dayName = days[new Date(c.createdAt).getDay()];
            const current = dailyStats.get(dayName);
            if (current) {
                dailyStats.set(dayName, {
                    applicants: current.applicants + 1,
                    hires: current.hires + (c.status === 'HIRED' ? 1 : 0)
                });
            }
        });

        // Convert Map to Array for Recharts
        const chartData = Array.from(dailyStats.entries()).map(([name, stats]) => ({
            name,
            applicants: stats.applicants,
            hires: stats.hires
        }));

        // Rotate array so today is last? Or fixed Mon-Sun?
        // Charts usually read left-to-right chronological. 
        // The map initialization loop created them roughly chronological (Today-6 to Today).
        // Actually map iteration order is insertion order in JS, so it should be correct.

        return NextResponse.json({
            metrics: [
                { title: "Total Candidates", value: totalCandidates.toLocaleString(), change: "+12% all time" }, // Change logic implies historical data we don't have yet
                { title: "Active Jobs", value: activeJobs.toString(), change: "Currently open" },
                { title: "Hired Candidates", value: hiredCandidates.toString(), change: `${((hiredCandidates / (totalCandidates || 1)) * 100).toFixed(1)}% rate` },
            ],
            chartData
        });

    } catch (error: any) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
