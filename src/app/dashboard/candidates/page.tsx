import prisma from "@/backhand/lib/db";
import CandidatesPage from "@/components/dashboard/CandidatesPageClient";

export const dynamic = "force-dynamic";

export default async function Page() {
    const [sourcedList, examList] = await Promise.all([
        prisma.candidate.findMany({
            where: { linkedinId: { not: null } },
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                _count: { select: { proctorLogs: true } },
                job: { select: { title: true } }
            }
        }),
        prisma.candidate.findMany({
            where: { linkedinId: null },
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                _count: { select: { proctorLogs: true } },
                job: { select: { title: true } }
            }
        })
    ]);

    console.log('[CandidatesPage] Sourced:', sourcedList.length);
    console.log('[CandidatesPage] Exam:', examList.length);

    // Sanitize
    const sanitize = (list: any[]) => list.map(c => ({ ...c, resumeData: null }));

    return (
        <CandidatesPage
            sourcedCandidates={sanitize(sourcedList)}
            examCandidates={sanitize(examList)}
        />
    );
}
