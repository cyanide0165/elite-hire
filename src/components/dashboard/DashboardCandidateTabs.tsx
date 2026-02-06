"use client";

import { useState } from "react";
import CandidateList from "./CandidateList";
import { Zap, Users } from "lucide-react";
import { cn } from "../../fronthand/lib/utils";

interface DashboardCandidateTabsProps {
    sourcedCandidates: any[];
    examCandidates: any[];
    onSelect?: (candidate: any) => void;
}

export default function DashboardCandidateTabs({ sourcedCandidates, examCandidates, onSelect }: DashboardCandidateTabsProps) {
    const [activeTab, setActiveTab] = useState<'sourced' | 'exam'>('sourced');

    return (
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold">Candidates</h3>

                <div className="flex p-1 bg-muted/50 rounded-xl gap-1">
                    <button
                        onClick={() => setActiveTab('sourced')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'sourced'
                                ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <Zap className={cn("w-4 h-4", activeTab === 'sourced' ? "text-purple-500" : "")} />
                        LinkedIn Sourced
                        <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                            {sourcedCandidates.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('exam')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'exam'
                                ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <Users className={cn("w-4 h-4", activeTab === 'exam' ? "text-indigo-500" : "")} />
                        Exam Takers
                        <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                            {examCandidates.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'sourced' ? (
                    <CandidateList candidates={sourcedCandidates} onSelect={onSelect} />
                ) : (
                    <CandidateList candidates={examCandidates} onSelect={onSelect} />
                )}
            </div>
        </div>
    );
}
