"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "SHORTLISTED" | "REJECTED">("IDLE");
    const [candidateId, setCandidateId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<string>("");
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [useTextInput, setUseTextInput] = useState(false);
    const [resumeText, setResumeText] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetch("/api/jobs")
            .then((res) => res.json())
            .then((data) => setJobs(data))
            .catch((err) => console.error(err));
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.[0]) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!file && !resumeText) return;

        setUploading(true);
        setStatus("PROCESSING");

        const formData = new FormData();

        if (useTextInput && resumeText) {
            // Create a text file from pasted content
            const blob = new Blob([resumeText], { type: 'text/plain' });
            formData.append("file", blob, "resume.txt");
        } else if (file) {
            formData.append("file", file);
        }

        formData.append("jobId", selectedJob);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setCandidateId(data.candidateId);
            setAnalysisData(data.analysis);

            if (data.status === "SHORTLISTED") {
                setStatus("SHORTLISTED");
            } else {
                setStatus("REJECTED");
            }

        } catch (error: any) {
            console.error(error);
            alert(error.message || "Something went wrong during upload.");
            setStatus("IDLE");
        } finally {
            setUploading(false);
        }
    };

    const handleStartAssessment = () => {
        if (candidateId) {
            router.push(`/candidate/assessment/${candidateId}`);
        }
    };

    return (
        <div className="container mx-auto max-w-xl py-20 px-4">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                ← Back to Home
            </Link>
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Upload Your Resume</h1>
                <p className="text-muted-foreground text-lg">
                    Our AI Gatekeeper will analyze your profile against our high-bar requirements.
                </p>
            </div>

            <div className="glass-card rounded-2xl p-8 transition-all duration-300">
                {status === "IDLE" && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select a Job Role</label>
                            <select
                                value={selectedJob}
                                onChange={(e) => setSelectedJob(e.target.value)}
                                className="w-full p-3 rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary focus:outline-none"
                            >
                                <option value="" disabled>Select a position...</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <button
                                onClick={() => setUseTextInput(false)}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                                    !useTextInput ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
                                )}
                            >
                                Upload File
                            </button>
                            <button
                                onClick={() => setUseTextInput(true)}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                                    useTextInput ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
                                )}
                            >
                                Paste Text
                            </button>
                        </div>

                        {useTextInput ? (
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume text here..."
                                className="w-full h-64 p-4 rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary focus:outline-none resize-none font-mono text-sm"
                            />
                        ) : (
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors",
                                    isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                                    file ? "bg-accent/50" : ""
                                )}
                            >
                                <input {...getInputProps()} />
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <FileText className="w-12 h-12 text-primary mb-4" />
                                        <p className="font-medium text-lg">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                        <p className="font-medium text-lg mb-1">Click to upload or drag and drop</p>
                                        <p className="text-sm text-muted-foreground">TXT or DOCX (Max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={(!file && !resumeText) || uploading || !selectedJob}
                            className="w-full bg-primary text-primary-foreground h-12 rounded-lg font-medium text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                                </span>
                            ) : (
                                "Analyze Profile"
                            )}
                        </button>
                    </div>
                )}

                {status === "PROCESSING" && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">Analyzing Resume</h3>
                            <p className="text-muted-foreground">AI is extracting skills and matching experience...</p>
                        </div>
                    </div>
                )}

                {status === "SHORTLISTED" && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-6 animate-in zoom-in duration-300">
                        <div className="bg-green-500/10 p-6 rounded-full">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-green-500">Shortlisted!</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Your profile matches our criteria. Proceed to assessment.
                            </p>
                        </div>
                        <button
                            onClick={handleStartAssessment}
                            className="w-full bg-green-600 text-white h-12 rounded-lg font-medium text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                        >
                            Start Assessment
                        </button>
                    </div>
                )}

                {status === "REJECTED" && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-6 animate-in zoom-in duration-300">
                        <div className="bg-red-500/10 p-6 rounded-full">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-red-500">Profile Not Matched</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Thank you for your interest. Your profile does not meet current requirements.
                            </p>
                        </div>
                        {analysisData && (
                            <div className="w-full bg-card/50 border border-border rounded-lg p-4 space-y-3 text-left">
                                <h4 className="font-semibold text-sm">Analysis Details:</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-muted-foreground">Match Score:</span> <span className="font-medium">{analysisData.matchScore || 0}/100</span></div>
                                    <div><span className="text-muted-foreground">Experience:</span> <span className="font-medium">{analysisData.experienceYears || 0} years</span></div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Skills Found:</span> <span className="font-medium">{analysisData.skills?.join(", ") || "None"}</span></div>
                                </div>
                                {analysisData.summary && (
                                    <p className="text-xs text-muted-foreground pt-2 border-t border-border whitespace-pre-line">{analysisData.summary}</p>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => { setFile(null); setStatus("IDLE"); setAnalysisData(null); }}
                            className="px-6 py-2 text-sm text-muted-foreground hover:text-foreground underline decoration-dashed"
                        >
                            Try another resume
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
