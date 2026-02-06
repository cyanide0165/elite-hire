import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { LinkedInService } from './linkedinService';
// Fix lint error about missing module if it persists due to non-relative lookup, but relative ./linkedinService should work.


const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    lazyConnect: true, // Don't connect immediately
    retryStrategy: (times) => {
        if (times > 3) {
            console.warn('[Redis] Connection failed 3 times. Queue disabled.');
            return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
    }
});

// Swallow error events to prevent crash
connection.on('error', (err) => {
    // console.warn('[Redis] Supressed error:', err.message);
});

export const linkedinQueue = new Queue('linkedin-candidate-search', { connection });

// Worker definition
// Note: In Next.js, workers ideally run in a separate process or custom server.
// We will initialize it here, but ensure it's a singleton to avoid multiple listeners in dev.

let worker: Worker;

export const initLinkedInWorker = () => {
    if (worker) return worker;

    worker = new Worker(
        'linkedin-candidate-search',
        async (job) => {
            console.log(`[LinkedInWorker] Processing job ${job.id}:`, job.data);
            const { jobId, criteria } = job.data;

            // Artificial delay for rate conditioning (User req: 2-5s)
            const delay = Math.floor(Math.random() * 3000) + 2000;
            await new Promise((resolve) => setTimeout(resolve, delay));

            await LinkedInService.searchAndStoreCandidates(jobId, criteria);
        },
        {
            connection,
            limiter: {
                max: 100, // Max 100 calls
                duration: 24 * 60 * 60 * 1000, // Per day (86400000ms)
            }
        }
    );

    worker.on('completed', (job) => {
        console.log(`[LinkedInWorker] Job ${job.id} completed!`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[LinkedInWorker] Job ${job?.id} failed: ${err.message}`);
        // Sentry logging could go here
    });

    return worker;
};
