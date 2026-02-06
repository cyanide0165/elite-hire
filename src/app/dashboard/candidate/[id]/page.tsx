import prisma from "@/backhand/lib/db";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import ResumeViewer from "@/fronthand/components/dashboard/ResumeViewer";

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await prisma.$queryRaw<any[]>`
        SELECT * FROM "Candidate" WHERE "id" = ${id} LIMIT 1
    `;
    const candidate = result[0];

    if (!candidate) return <div>Candidate not found</div>;

    // Fetch proctor logs separately as raw join is messy
    const proctorLogs = await prisma.proctorLog.findMany({
        where: { candidateId: id },
        orderBy: { timestamp: 'desc' }
    });

    // Combine
    candidate.proctorLogs = proctorLogs;

    const skills = JSON.parse(candidate.skills || "[]");
    const getStatusColor = (status: string) => status === "HIRED" ? "text-green-500" : status === "SHORTLISTED" ? "text-blue-500" : "text-red-500";

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mb-8">
                <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{candidate.name}</h1>
                        <p className="text-muted-foreground">{candidate.email} • {candidate.experienceYears} Years Exp</p>



                        {candidate.resumeUrl ? (
                            <ResumeViewer
                                url={candidate.resumeUrl}
                                candidateName={candidate.name}
                                fileType={candidate.resumeType || "application/pdf"}
                            />
                        ) : (
                            <button
                                disabled
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium cursor-not-allowed opacity-75"
                            >
                                <FileText className="w-4 h-4" />
                                No Resume Uploaded
                            </button>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Final Decision</div>
                        <div className={`text-4xl font-bold ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-xl border border-primary/20 bg-primary/5">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            Assessment Rationale
                        </h3>
                        <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line">
                            {candidate.rationale || "No rationale generated yet."}
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-xl z-10 relative">
                        <h3 className="text-lg font-bold mb-4">Assessment Audit Log</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {candidate.proctorLogs.length === 0 ? (
                                <div className="flex items-center gap-3 text-sm text-green-500 bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span>Clean Record. No violations detected during assessment.</span>
                                </div>
                            ) : (
                                candidate.proctorLogs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3 text-sm text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        <div>
                                            <span className="font-bold">{log.eventType.replace(/_/g, " ")}</span>
                                            <span className="text-muted-foreground mx-1">•</span>
                                            <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            {log.details && <p className="text-xs text-muted-foreground mt-1 text-white/50">{log.details}</p>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4">Skill Match</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card p-6 rounded-xl border border-border text-center">
                            <div className="text-muted-foreground text-sm mb-2">Technical Score</div>
                            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                                {candidate.technicalScore || 0}
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-xl border border-border text-center">
                            <div className="text-muted-foreground text-sm mb-2">Psychometric Score</div>
                            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-400">
                                {candidate.softSkillScore || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
