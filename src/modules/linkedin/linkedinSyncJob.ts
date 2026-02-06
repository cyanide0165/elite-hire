import cron from 'node-cron';
import prisma from '@/backhand/lib/db';
import { linkedinQueue } from './linkedinQueue';
import { LinkedInService } from './linkedinService';

const db = prisma;
// import { PrismaClient } from '@prisma/client';

export const startLinkedInCronJobs = () => {
    // Weekly Sync: Runs every Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
        console.log('[Cron] Starting Weekly LinkedIn Sync...');
        // Fetch all active sourced candidates and refresh
        const sourcedCandidates = await db.candidate.findMany({
            where: { status: 'SOURCED', linkedinId: { not: null } }
        });

        // Naively re-queue searches or refresh individual profiles
        // For now, let's log. A full re-scrape is expensive.
        // Better: Refresh expired tokens or just re-run search for active jobs.
        console.log(`[Cron] Would refresh ${sourcedCandidates.length} candidates.`);
    });

    // Cleanup: Purge candidates older than 30 days if not engaged
    cron.schedule('0 0 * * *', async () => {
        console.log('[Cron] Running Candidate Cleanup...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deleted = await db.candidate.deleteMany({
            where: {
                createdAt: { lt: thirtyDaysAgo },
                status: 'SOURCED', // Only auto-purge sourced ones that weren't progressed
            }
        });
        console.log(`[Cron] Purged ${deleted.count} old candidates.`);
    });
};
