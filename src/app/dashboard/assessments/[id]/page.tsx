import AssessmentEditor from "../../../../fronthand/components/dashboard/AssessmentEditor";
import prisma from "@/backhand/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AssessmentConfigPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;



    // Use raw query to ensure we get the JSON fields even if client is stale
    const jobs = await prisma.$queryRaw<any[]>`SELECT * FROM "Job" WHERE "id" = ${id} LIMIT 1`;
    const job = jobs[0];

    if (!job) {
        return <div>Job not found</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/dashboard/assessments" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Assessments
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Configure Assessment</h1>
                <p className="text-muted-foreground">Editing assessment for <span className="font-semibold text-foreground">{job.title}</span></p>
            </div>

            <AssessmentEditor job={job} />
        </div>
    );
}
