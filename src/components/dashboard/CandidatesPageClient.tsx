"use client";

import { useState } from "react";
import CandidateList from "@/components/dashboard/CandidateList";
import CandidatePreviewPanel from "@/components/dashboard/CandidatePreviewPanel";
import DashboardCandidateTabs from "@/components/dashboard/DashboardCandidateTabs";

interface CandidatesPageProps {
    sourcedCandidates: any[];
    examCandidates: any[];
}

export default function CandidatesPage({ sourcedCandidates, examCandidates }: CandidatesPageProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    return (
        <div className="h-[calc(100vh-6rem)] flex gap-6">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Candidates</h1>
                    <p className="text-muted-foreground">Manage and review all candidates across all jobs.</p>
                </div>

                <div className="flex-1 min-h-0">
                    <DashboardCandidateTabs
                        sourcedCandidates={sourcedCandidates}
                        examCandidates={examCandidates}
                        onSelect={(candidate) => setSelectedCandidate(candidate)}
                    />
                </div>
            </div>

            {selectedCandidate && (
                <CandidatePreviewPanel
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                />
            )}
        </div>
    );
}
