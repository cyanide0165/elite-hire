import { FileText, Settings, ArrowRight } from "lucide-react";
import prisma from "@/backhand/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AssessmentsPage() {
    // Raw query to fetch jobs and count candidates
    // Note: _count in prisma is harder to replicate 1:1 in raw simply, but we can do a subquery or separate query.
    // For simplicity given the issue, we'll just fetch jobs and their assessment details.

    const jobs = await prisma.$queryRaw<any[]>`
        SELECT j.*, (SELECT COUNT(*) FROM "Candidate" c WHERE c."jobId" = j."id") as candidate_count
        FROM "Job" j
        ORDER BY j."createdAt" DESC
    `;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Assessment Configuration</h2>
                <p className="text-muted-foreground">Customize coding challenges, MCQs, and psychometric profiles for each job role.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => (
                    <div key={job.id} className="glass-card p-6 rounded-xl border border-border hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                                <p className="text-sm text-muted-foreground">Created {new Date(job.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg">
                                <span className="text-muted-foreground">Coding Challenge</span>
                                <span className={job.codingDetails ? "text-green-500 font-medium" : "text-yellow-500 font-medium"}>
                                    {job.codingDetails ? "Configured" : "Default"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg">
                                <span className="text-muted-foreground">Aptitude (MCQ)</span>
                                <span className={job.mcqDetails ? "text-green-500 font-medium" : "text-yellow-500 font-medium"}>
                                    {job.mcqDetails ? "Custom" : "Default"}
                                </span>
                            </div>
                        </div>

                        <Link
                            href={`/dashboard/assessments/${job.id}`}
                            className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-2.5 rounded-lg font-medium transition-all"
                        >
                            <Settings className="w-4 h-4" />
                            Configure Assessment
                        </Link>
                    </div>
                ))}

                {jobs.length === 0 && (
                    <div className="col-span-full text-center p-12 text-muted-foreground">
                        No jobs found. Please create a job first to configure its assessment.
                    </div>
                )}
            </div>
        </div>
    );
}
