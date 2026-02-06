import prisma from "@/backhand/lib/db";
import { notFound } from "next/navigation";
import JobWorkspace from "@/components/dashboard/JobWorkspace";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch job with candidates
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            candidates: {
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { proctorLogs: true } } }
            }
        }
    });

    if (!job) {
        notFound();
    }

    // Sanitize candidates
    const sanitizedCandidates = job.candidates.map(c => ({
        ...c,
        resumeData: null
    }));

    // Create a plain job object without the raw candidates array to avoid serialization issues
    const { candidates, ...jobWithoutCandidates } = job;

    return (
        <JobWorkspace job={jobWithoutCandidates} candidates={sanitizedCandidates} />
    );
}
