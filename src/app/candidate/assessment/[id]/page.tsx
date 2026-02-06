import AssessmentFlow from "@/components/assessment/AssessmentFlow";
import prisma from "@/backhand/lib/db";

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const candidates = await prisma.$queryRaw<any[]>`
        SELECT c.*, j."codingDetails", j."mcqDetails", j."psychometricDetails"
        FROM "Candidate" c
        LEFT JOIN "Job" j ON c."jobId" = j."id"
        WHERE c."id" = ${id}
        LIMIT 1
    `;
    const candidate = candidates[0];

    // Map the raw flat result to the structure expected
    if (candidate) {
        candidate.job = {
            codingDetails: candidate.codingDetails,
            mcqDetails: candidate.mcqDetails,
            psychometricDetails: candidate.psychometricDetails
        };
    }

    if (!candidate) return <div>Candidate not found</div>;

    // Parse configs if they exist
    // Helper for safe parsing
    const safeParse = (data: any) => {
        if (!data || typeof data !== 'string') return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.warn("Failed to parse config:", data.substring(0, 50) + "...");
            return null;
        }
    };

    // Parse configs if they exist
    const assessmentConfig = {
        coding: safeParse(candidate.job?.codingDetails),
        mcq: safeParse(candidate.job?.mcqDetails),
        psychometric: safeParse(candidate.job?.psychometricDetails),
    };

    return <AssessmentFlow candidateId={id} assessmentConfig={assessmentConfig} />;
}
