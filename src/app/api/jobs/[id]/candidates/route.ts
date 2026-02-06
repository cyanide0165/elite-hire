import { NextRequest, NextResponse } from 'next/server';
import { LinkedInService } from '@/modules/linkedin/linkedinService';

// params is a Promise in Next.js 15+, but typically in 14 it's an object. 
// However, to be safe with types, we can treat it as { params: { id: string } }
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const jobId = resolvedParams.id;

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID missing' }, { status: 400 });
        }

        const candidates = await LinkedInService.getJobCandidates(jobId);

        return NextResponse.json({
            success: true,
            data: candidates
        });

    } catch (error: any) {
        console.error('[API] Get Candidates Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch candidates' },
            { status: 500 }
        );
    }
}
