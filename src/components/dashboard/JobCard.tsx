import Link from "next/link";
import { Briefcase, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { cn, jobStatusStyles } from "@/lib/utils";

interface JobCardProps {
    job: {
        id: string;
        title: string;
        department: string | null;
        location: string | null;
        type: string | null;
        createdAt: Date;
        _count: {
            candidates: number;
        };
    };
}

export default function JobCard({ job }: JobCardProps) {
    const isNew = new Date(job.createdAt) > new Date(Date.now() - 86400000); // 24 hours

    return (
        <div className="glass-card group p-6 rounded-2xl relative flex flex-col h-full hover:border-primary/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Briefcase className="w-6 h-6" />
                </div>
                <span className={cn(jobStatusStyles("Active"), "px-3 py-1")}>
                    {isNew ? "New" : "Active"}
                </span>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1" title={job.title}>
                {job.title}
            </h3>

            <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.department || 'Engineering'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{job.type || 'Full-time'}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(3, job._count.candidates))].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground">
                                <Users className="w-3 h-3" />
                            </div>
                        ))}
                        {job._count.candidates > 3 && (
                            <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground">
                                +{job._count.candidates - 3}
                            </div>
                        )}
                    </div>
                    {job._count.candidates === 0 && <span className="text-sm text-muted-foreground">No applicants</span>}
                </div>

                <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all transform group-hover:translate-x-1"
                >
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
