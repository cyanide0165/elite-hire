import { NextRequest, NextResponse } from 'next/server';
import { linkedinQueue } from '@/modules/linkedin/linkedinQueue';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { jobId, criteria } = body;

        // Basic Validation
        if (!jobId || !criteria || !criteria.skills || !Array.isArray(criteria.skills)) {
            return NextResponse.json(
                { error: 'Invalid request body. jobId and criteria.skills are required.' },
                { status: 400 }
            );
        }

        // Add to Queue
        // Add to Queue
        try {
            await linkedinQueue.add('search-job', {
                jobId,
                criteria
            });

            return NextResponse.json({
                success: true,
                message: 'Search queued successfully.',
                status: 'QUEUED'
            });
        } catch (queueError: any) {
            console.warn('[API] Redis Queue unavailable. Falling back to direct execution for DEV/DEMO.');

            // Fallback: Execute directly
            try {
                // Dynamic import to avoid circular dependency issues at top level if any
                const { LinkedInService } = await import('@/modules/linkedin/linkedinService');
                await LinkedInService.searchAndStoreCandidates(jobId, criteria);

                return NextResponse.json({
                    success: true,
                    message: 'Search executed directly (Dev Fallback).',
                    status: 'COMPLETED'
                });
            } catch (directError: any) {
                console.error('[API] Direct execution failed:', directError);
                return NextResponse.json(
                    { error: `Direct execution failed: ${directError.message || directError}` },
                    { status: 500 }
                );
            }
        }

    } catch (error: any) {
        console.error('[API] Search Queue Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
