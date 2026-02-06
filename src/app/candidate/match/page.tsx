"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, Briefcase, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function JobMatchPage() {
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [matches, setMatches] = useState<any[] | null>(null);
    const router = useRouter();

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles?.[0]) setFile(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
        maxFiles: 1,
    });

    const handleAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/jobs/recommend", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.matches) {
                setMatches(data.matches);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to analyze resume");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                ← Back to Home
            </Link>

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Find Your Perfect Fit</h1>
                <p className="text-lg text-muted-foreground">Upload your resume and let our AI match you with the best open roles.</p>
            </div>

            {!matches ? (
                <div className="glass-card rounded-2xl p-8 max-w-xl mx-auto">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all h-64",
                            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                            file ? "bg-accent/50 border-primary" : ""
                        )}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in">
                                <FileText className="w-12 h-12 text-primary mb-4" />
                                <p className="font-medium text-lg">{file.name}</p>
                                <button className="mt-2 text-sm text-muted-foreground hover:underline" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Change file</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <div className="bg-primary/10 p-4 rounded-full mb-4">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <p className="font-medium text-lg">Upload Resume</p>
                                <p className="text-sm text-muted-foreground">PDF or DOCX</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={!file || analyzing}
                        className="w-full mt-6 bg-primary text-primary-foreground h-12 rounded-lg font-medium text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
                        {analyzing ? "Analyzing Skills..." : "Find Matching Jobs"}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Top Recommendations</h2>
                        <button onClick={() => setMatches(null)} className="text-sm text-primary hover:underline">Scan another resume</button>
                    </div>

                    {matches.length === 0 ? (
                        <div className="text-center p-12 border border-border rounded-xl bg-card/50">
                            <p className="text-lg text-muted-foreground">No strong matches found for current openings.</p>
                        </div>
                    ) : (
                        matches.map((match: any, i) => (
                            <div key={match.job.id} className="glass-card p-6 rounded-xl border border-border hover:border-primary/50 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold">{match.job.title}</h3>
                                            {i === 0 && <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Best Match</span>}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                            <span>{match.job.department || 'Engineering'}</span>
                                            <span>•</span>
                                            <span>{match.job.location || 'Remote'}</span>
                                            <span>•</span>
                                            <span>{match.job.type || 'Full-time'}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{match.reason}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-2xl font-bold text-primary">{match.score}%</div>
                                        <span className="text-xs text-muted-foreground">Match Score</span>
                                        <Link href={`/candidate/upload?jobId=${match.job.id}`} className="mt-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                            Apply Now <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
