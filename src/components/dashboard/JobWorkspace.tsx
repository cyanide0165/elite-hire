"use client";

import { useState } from "react";
import CandidateList from "@/components/dashboard/CandidateList";
import CandidatePreviewPanel from "@/components/dashboard/CandidatePreviewPanel";
import { ArrowLeft, MapPin, Clock, User, Calendar } from "lucide-react";
import Link from "next/link";
import { JobDetailsTabs } from "./JobDetailsTabs"; // Assuming this is reusable or I might duplicate logic if simple
import JobAnalytics from "./JobAnalytics";
import { LinkedInIntegration } from "../linkedin/LinkedInIntegration";
import { LinkedInSearchModal } from "../linkedin/LinkedInSearchModal"; // Adjust module

interface JobWorkspaceProps {
    job: any;
    candidates: any[];
}

export default function JobWorkspace({ job, candidates }: JobWorkspaceProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

    return (
        <div className="flex h-[calc(100vh-6rem)] overflow-hidden gap-6">
            {/* Left Sidebar: Job Info (Hidden on mobile, 25%) */}
            <div className="hidden lg:flex flex-col w-1/4 min-w-[300px] gap-6 overflow-y-auto pr-2">
                <div>
                    <Link href="/dashboard/jobs" className="flex items-center text-muted-foreground hover:text-foreground mb-4 w-fit transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">{job.title}</h1>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {job.location || 'Remote'}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {job.type || 'Full-time'}</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {job.department || 'Engineering'}</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Posted {new Date(job.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Quick Stats or Actions */}
                <div className="glass-card p-4 rounded-xl space-y-4">
                    <h3 className="font-semibold text-sm">Target Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {["React", "TypeScript", "Node.js"].map(s => (
                            <span key={s} className="px-2 py-1 bg-secondary rounded-md text-xs">{s}</span>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-4 rounded-xl">
                    <button
                        onClick={() => setIsLinkedInModalOpen(true)}
                        className="w-full bg-[#0077b5] hover:bg-[#006097] text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Source Candidates
                    </button>
                </div>
            </div>

            {/* Center: Candidate List (FlexGrow) */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="mb-4 lg:hidden">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                </div>
                <CandidateList
                    candidates={candidates}
                    onSelect={(candidate) => setSelectedCandidate(candidate)}
                />
            </div>

            {/* Right: Preview Panel (Overlay or Fixed) handled by the Panel component itself, or conditional render here */}
            {selectedCandidate && (
                <CandidatePreviewPanel
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                />
            )}

            {/* LinkedIn Modal */}
            <LinkedInSearchModal
                isOpen={isLinkedInModalOpen}
                onClose={() => setIsLinkedInModalOpen(false)}
                onSearchQueued={() => setIsLinkedInModalOpen(false)}
                jobId={job.id}
            />
        </div>
    );
}
