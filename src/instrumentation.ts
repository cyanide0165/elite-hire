import { initLinkedInWorker } from './modules/linkedin/linkedinQueue';
import { startLinkedInCronJobs } from './modules/linkedin/linkedinSyncJob';

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('[Instrumentation] Starting background services...');
        initLinkedInWorker();
        startLinkedInCronJobs();
    }
}
