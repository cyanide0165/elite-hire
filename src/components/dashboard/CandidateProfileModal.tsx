"use client";

import { X, User, Mail, Briefcase, Award, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { statusStyles } from "../../fronthand/lib/utils";

interface CandidateProfileModalProps {
    candidate: any;
    onClose: () => void;
}

export default function CandidateProfileModal({ candidate, onClose }: CandidateProfileModalProps) {
    if (!candidate) return null;

    const skills = candidate.skills ? JSON.parse(candidate.skills) : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-card w-full max-w-3xl rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-50 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-start bg-muted/30">
                    <div className="flex gap-4">
                        <div className="bg-primary/10 p-3 rounded-full h-fit">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {candidate.name}
                                <span className={`${statusStyles(candidate.status)} text-xs px-2 py-0.5 rounded-full`}>
                                    {candidate.status.replace("_", " ")}
                                </span>
                            </h2>
                            <div className="flex flex-col gap-1 text-muted-foreground text-sm mt-1">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> {candidate.email}
                                </div>
                                {candidate.phone && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-3 h-3" /> {candidate.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">

                    {/* Score Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/50 p-4 rounded-lg border border-border text-center">
                            <div className="text-sm text-muted-foreground mb-1">Match Score</div>
                            <div className="text-2xl font-bold text-primary">{candidate.matchScore || 0}%</div>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg border border-border text-center">
                            <div className="text-sm text-muted-foreground mb-1">Technical</div>
                            <div className="text-2xl font-bold">{candidate.technicalScore || 0}/100</div>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg border border-border text-center">
                            <div className="text-sm text-muted-foreground mb-1">Soft Skills</div>
                            <div className="text-2xl font-bold">{candidate.softSkillScore || 0}/100</div>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg border border-border text-center">
                            <div className="text-sm text-muted-foreground mb-1">Aptitude</div>
                            <div className="text-2xl font-bold">{candidate.mcqScore || 0}/100</div>
                        </div>
                    </div>

                    {/* AI Analysis */}
                    {candidate.rationale && (
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Award className="w-4 h-4 text-purple-500" /> AI Analysis
                            </h3>
                            <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-lg text-sm leading-relaxed text-muted-foreground">
                                {candidate.rationale}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" /> Extracted Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill: string, i: number) => (
                                    <span key={i} className="bg-secondary px-2.5 py-1 rounded-md text-xs font-medium border border-border text-secondary-foreground">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Proctoring Summary (Mock Logic for now based on scores) */}
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" /> Proctoring Status
                        </h3>
                        {candidate.technicalScore && candidate.technicalScore < 50 ? (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                <div>
                                    <div className="font-medium text-yellow-500">Suspicious Activity Detected</div>
                                    <div className="text-xs text-muted-foreground">Low technical score correlates with potential proctoring flags. Check full logs.</div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <div>
                                    <div className="font-medium text-green-500">Clean Session</div>
                                    <div className="text-xs text-muted-foreground">No significant violations recorded during assessment.</div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <a
                        href={`/dashboard/candidate/${candidate.id}`}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        View Full Details
                    </a>
                </div>
            </div>
        </div>
    );
}
