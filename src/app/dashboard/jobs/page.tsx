import Link from "next/link";
import prisma from "@/backhand/lib/db";
import JobCard from "@/components/dashboard/JobCard";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
    const jobs = await prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { candidates: true } } }
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Active Jobs</h2>
                    <p className="text-muted-foreground">Manage your job openings and track applicant pipelines.</p>
                </div>
                <Link
                    href="/dashboard/jobs/new"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Post New Job
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 border-border/50">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
                    <p className="text-muted-foreground max-w-md mb-8">Get started by creating your first job posting. You can then source candidates from LinkedIn or track applicants.</p>
                    <Link
                        href="/dashboard/jobs/new"
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Create Job
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}

                    {/* Ghost Card for "Add New" visual cue */}
                    <Link href="/dashboard/jobs/new" className="group border-2 border-dashed border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-medium">Create New Job</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
