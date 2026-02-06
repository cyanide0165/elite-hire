"use client";

import { X, Mail, Phone, Linkedin, MapPin, Briefcase, Calendar, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn, statusStyles } from "@/lib/utils";

interface CandidatePreviewPanelProps {
    candidate: any;
    onClose: () => void;
}

export default function CandidatePreviewPanel({ candidate, onClose }: CandidatePreviewPanelProps) {
    if (!candidate) return null;

    return (
        <div className="h-full flex flex-col glass-card border-l border-border/50 bg-card/95 backdrop-blur-xl animate-fade-in lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-[400px] lg:z-40 lg:border-l lg:border-white/10 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-lg font-bold">
                            {candidate.name.charAt(0)}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-tight">{candidate.name}</h2>
                        <p className="text-sm text-muted-foreground">{candidate.headline || 'No headline provided'}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Actions */}
                <div className="flex gap-2">
                    <button className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/25">
                        Contact
                    </button>
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 py-2 rounded-lg text-sm font-medium transition-colors">
                        Shortlist
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-xs text-muted-foreground block mb-1">Match Score</span>
                        <div className="text-xl font-bold text-green-400">{candidate.matchScore || 0}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-xs text-muted-foreground block mb-1">Experience</span>
                        <div className="text-xl font-bold">{candidate.experienceYears || 0} Yrs</div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact Info</h3>
                    <div className="space-y-3 text-sm">
                        {candidate.email && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="w-4 h-4 text-primary" />
                                {candidate.email}
                            </div>
                        )}
                        {candidate.phone && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="w-4 h-4 text-primary" />
                                {candidate.phone}
                            </div>
                        )}
                        {candidate.linkedinId && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Linkedin className="w-4 h-4 text-blue-400" />
                                <span className="text-blue-400 underline cursor-pointer">LinkedIn Profile</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {candidate.skills?.split(',').map((skill: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-300">
                                {skill.trim()}
                            </span>
                        )) || <p className="text-sm text-muted-foreground">No skills listed</p>}
                    </div>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Experience Summary</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {candidate.experienceSummary || "No summary available."}
                    </p>
                </div>
            </div>

            {/* Footer Status */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Current Status</span>
                    <span className={statusStyles(candidate.status)}>{candidate.status}</span>
                </div>
            </div>
        </div>
    );
}
