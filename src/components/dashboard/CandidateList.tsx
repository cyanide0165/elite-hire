"use client";

import { useState, useMemo } from "react";
import { User, AlertTriangle, Eye, Search, Filter, Linkedin, Download } from "lucide-react";
import { statusStyles, cn } from "@/lib/utils";
import CandidateProfileModal from "./CandidateProfileModal";

interface CandidateListProps {
    candidates: any[];
    onSelect?: (candidate: any) => void;
    compact?: boolean;
}

export default function CandidateList({ candidates, onSelect, compact = false }: CandidateListProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Filter Logic
    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate => {
            const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                candidate.skills?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "ALL" || candidate.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [candidates, searchQuery, statusFilter]);

    const handleSelect = (candidate: any) => {
        if (onSelect) {
            onSelect(candidate);
        } else {
            setSelectedCandidate(candidate);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, skills, or email..."
                        className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="px-4 py-2 bg-card/50 border border-border/50 rounded-xl text-sm focus:outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="HIRED">Hired</option>
                    </select>
                    <button className="p-2 border border-border/50 rounded-xl hover:bg-muted transition-colors" title="Export">
                        <Download className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl border border-border/50 flex-1 overflow-hidden flex flex-col shadow-xl">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm relative border-collapse">
                        <thead className="bg-muted/30 backdrop-blur-md sticky top-0 z-10 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                            <tr>
                                <th className="p-5">Candidate</th>
                                <th className="p-5">Match & Skills</th>
                                {!compact && <th className="p-5">Experience</th>}
                                <th className="p-5">Status</th>
                                {!compact && <th className="p-5 text-center">Integrity</th>}
                                <th className="p-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-3 rounded-full bg-muted">
                                                <Search className="w-6 h-6 opacity-50" />
                                            </div>
                                            <p>No candidates found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCandidates.map((candidate) => (
                                    <tr
                                        key={candidate.id}
                                        className="hover:bg-primary/5 transition-colors cursor-pointer group border-b border-border/30 last:border-0"
                                        onClick={() => handleSelect(candidate)}
                                    >
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-indigo-500/20">
                                                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                                                        <span className="font-bold text-primary">{candidate.name.charAt(0)}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground flex items-center gap-2">
                                                        {candidate.name}
                                                        {candidate.linkedinId && <Linkedin className="w-3 h-3 text-blue-400" />}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{candidate.email || 'No email provided'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-5 max-w-[200px]">
                                            <div className="mb-2 flex items-center gap-2">
                                                {candidate.matchScore ? (
                                                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border",
                                                        candidate.matchScore > 80 ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                            candidate.matchScore > 50 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                                    )}>
                                                        {candidate.matchScore}% Match
                                                    </span>
                                                ) : <span className="text-xs text-muted-foreground">Not Scored</span>}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {candidate.skills?.split(',').slice(0, 3).map((skill: string, i: number) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                                {candidate.skills?.split(',').length > 3 && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{candidate.skills.split(',').length - 3}</span>
                                                )}
                                            </div>
                                        </td>

                                        {!compact && (
                                            <td className="p-5">
                                                <div className="text-sm font-medium">{candidate.experienceYears ? `${candidate.experienceYears} Years` : 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1 truncate max-w-[150px]" title={candidate.headline}>
                                                    {candidate.headline || 'No headline'}
                                                </div>
                                            </td>
                                        )}

                                        <td className="p-5">
                                            <span className={statusStyles(candidate.status)}>
                                                {candidate.status.replace("_", " ")}
                                            </span>
                                        </td>

                                        {!compact && (
                                            <td className="p-5 text-center">
                                                {(() => {
                                                    const count = candidate._count?.proctorLogs || 0;
                                                    if (count > 10) return <span className="inline-flex items-center gap-1 text-xs text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3" /> Risk</span>;
                                                    if (count >= 3) return <span className="inline-flex items-center gap-1 text-xs text-yellow-500 font-medium bg-yellow-500/10 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3" /> Warn</span>;
                                                    return <span className="inline-flex items-center gap-1 text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded-full">Safe</span>;
                                                })()}
                                            </td>
                                        )}

                                        <td className="p-5 text-right">
                                            <button
                                                suppressHydrationWarning
                                                className="bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg p-2 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect(candidate);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Only show internal modal if no external handler is provided */}
            {!onSelect && selectedCandidate && (
                <CandidateProfileModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                />
            )}
        </div>
    );
}
