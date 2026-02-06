"use client";

import { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import PsychometricSection from "./PsychometricSection";
import MCQSection from "./MCQSection";
import { CameraProctor } from "@/components/proctoring/CameraProctor";
import { tabStyles } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useProctoring } from "@/hooks/useProctoring";
import SystemCheck from "../assessment/SystemCheck"; // Importing from sibling/parent? Check path.

interface AssessmentFlowProps {
    candidateId: string;
    assessmentConfig?: {
        coding?: {
            title: string;
            problemStatement: string;
            initialCode: string;
            testCases: { input: string; output: string }[];
        };
        mcq?: any[];
        psychometric?: any;
    };
}

export default function AssessmentFlow({ candidateId, assessmentConfig }: AssessmentFlowProps) {
    const proctoring = useProctoring();
    const [isStarted, setIsStarted] = useState(false);

    const [stage, setStage] = useState<"psychometric" | "mcq" | "coding" | "completed" | "rejected">("psychometric");

    const defaultCode = assessmentConfig?.coding?.initialCode || `function twoSum(nums, target) {
  // Your solution here
  
}

// Test Case
console.log(twoSum([2, 7, 11, 15], 9));`;

    const [code, setCode] = useState(defaultCode);
    const [language, setLanguage] = useState<"javascript" | "python" | "java">("javascript");

    const templates = {
        javascript: assessmentConfig?.coding?.initialCode || `function twoSum(nums, target) {
  // Your code here
  
}

// Test Case
console.log(twoSum([2, 7, 11, 15], 9));`,
        python: `def solution():\n    # python support pending for custom Qs\n    pass`,
        java: `public class Main {\n    public static void main(String[] args) {\n        // java support pending\n    }\n}`
    };

    const [psychometricData, setPsychometricData] = useState<any>({ scores: { resilience: 50, teamwork: 50 }, textResponse: "" });
    const [mcqScore, setMcqScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [proctoringViolations, setProctoringViolations] = useState(0);

    const [violationError, setViolationError] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<{ message: string, onConfirm: () => void } | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes per section

    // Timer Logic
    useEffect(() => {
        if (!isStarted || stage === 'completed' || stage === 'rejected' || isSubmitting) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isStarted, stage, isSubmitting]);

    useEffect(() => {
        setTimeLeft(600);
    }, [stage]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAutoSubmit = () => {
        if (stage === 'psychometric') {
            const avgScore = (psychometricData.scores.resilience + psychometricData.scores.teamwork) / 2;
            if (avgScore < 40) {
                setViolationError("Time Expired. Based on the incomplete profile, we cannot proceed.");
                setStage("rejected");
            } else {
                setNotification("Time's up! Auto-submitting Psychometric Profile.");
                setStage("mcq");
            }
        } else if (stage === 'mcq') {
            setNotification("Time's up! Auto-submitting MCQ Answers.");
            setStage("coding");
        } else if (stage === 'coding') {
            setNotification("Time's up! Auto-submitting Final Assessment.");
            submitFinalAssessment();
        }
    };

    useEffect(() => {
        if (!isStarted || stage === 'completed' || stage === 'rejected') return;

        const handleFullScreenChange = () => {
            if (!document.fullscreenElement && !isSubmitting) {
                setViolationError("Examination Terminated. You exited full-screen mode, which is a critical violation of proctoring protocols.");
                setStage("rejected");
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
    }, [isStarted, stage, isSubmitting]);

    const runCode = async (codeToRun: string) => {
        const res = await fetch("/api/execute", {
            method: "POST",
            body: JSON.stringify({ code: codeToRun, language: "javascript" }),
        });
        const data = await res.json();
        return data.output;
    };

    const submitPsychometric = () => {
        setConfirmation({
            message: "Are you sure you want to submit your Psychometric Profile? This section cannot be edited once submitted.",
            onConfirm: () => {
                setConfirmation(null);
                const avgScore = (psychometricData.scores.resilience + psychometricData.scores.teamwork) / 2;

                if (avgScore < 40) {
                    setViolationError("Based on the psychometric evaluation, we have determined that this role is not the best fit for your current profile.");
                    setStage("rejected");
                } else {
                    setStage("mcq");
                }
            }
        });
    };

    const submitMCQ = () => {
        if (mcqScore === 0) {
            setConfirmation({
                message: "Your MCQ score is 0 (or unattempted). Are you sure you want to proceed?",
                onConfirm: () => {
                    setConfirmation(null);
                    setStage("coding");
                }
            });
            return;
        }
        setStage("coding");
    };

    const submitFinalAssessment = async () => {
        if (timeLeft > 1) {
            setConfirmation({
                message: "Are you sure you want to submit the Final Coding Solution? This cannot be undone.",
                onConfirm: executeSubmission
            });
        } else {
            executeSubmission();
        }
    };

    const executeSubmission = async () => {
        setConfirmation(null);
        setIsSubmitting(true);
        try {
            let technicalScore = 20;

            try {
                const output = await runCode(code);
                const expectedOutput = assessmentConfig?.coding?.testCases?.[0]?.output || "[0,1]";
                const normalizedOutput = output ? output.toString().replace(/\s/g, "") : "";
                const normalizedExpected = expectedOutput.replace(/\s/g, "");

                if (normalizedOutput.includes(normalizedExpected)) {
                    technicalScore = 80;
                }
            } catch (err) {
                console.error("Validation failed", err);
            }

            const psychometricScore = (psychometricData.scores.resilience + psychometricData.scores.teamwork) / 2;

            const res = await fetch("/api/assessment/submit", {
                method: "POST",
                body: JSON.stringify({
                    candidateId: candidateId,
                    technicalScore: (technicalScore + mcqScore) / 2,
                    psychometricScore,
                    mcqScore,
                    code,
                    psychometricData,
                    proctorLogs: proctoring.getViolationLog()
                }),
            });

            if (res.ok) {
                setNotification("Assessment Submitted Successfully!");
                if (document.fullscreenElement) {
                    await document.exitFullscreen().catch(err => console.error(err));
                }
                window.location.replace("/candidate/thank-you");
            } else {
                const data = await res.json();
                setNotification(data.error || "Submission failed.");
            }
        } catch (e: any) {
            console.error(e);
            setNotification(e.message || "Error submitting.");
        }
    };

    // System Check Screen
    if (!isStarted && stage !== 'rejected') {
        return <SystemCheck proctoring={proctoring} onReady={() => {
            setIsStarted(true);
            proctoring.startRecording(); // Start flagging violations
        }} />;
    }

    if (stage === "rejected") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⛔</div>
                    <h1 className="text-2xl font-bold text-foreground">Application Status</h1>
                    <p className="text-muted-foreground">
                        {violationError || "Thank you for your application. We will not be proceeding further."}
                    </p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="bg-secondary hover:bg-secondary/80 text-foreground px-6 py-2 rounded-lg"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground relative">

            {/* Custom Confirmation Modal */}
            {confirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card border border-border p-6 rounded-xl max-w-md w-full shadow-2xl space-y-6">
                        <h3 className="text-xl font-bold">Please Confirm</h3>
                        <p className="text-muted-foreground">{confirmation.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmation(null)}
                                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmation.onConfirm}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Notification Toast */}
            {notification && (
                <div className="fixed top-20 right-6 z-50 bg-foreground text-background px-6 py-4 rounded-lg shadow-xl animate-in slide-in-from-right">
                    {notification}
                    <button onClick={() => setNotification(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}

            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-xl tracking-tight">Elite Hire Assessment Center</h1>
                    <div className="h-6 w-px bg-border mx-2" />
                    {/* Progress Indicator (Not Clickable) */}
                    <nav className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage === 'psychometric' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>1. Character</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage === 'mcq' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>2. Aptitude</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage === 'coding' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>3. Code</span>
                    </nav>
                </div>

                {/* Timer Display */}
                <div className={`font-mono text-xl font-bold px-4 py-1 rounded-md border ${timeLeft < 60 ? 'bg-red-500/10 text-red-500 border-red-500/50 animate-pulse' : 'bg-muted border-border'}`}>
                    {formatTime(timeLeft)}
                </div>

                {/* Dynamic Action Button */}
                <div>
                    {stage === 'psychometric' && (
                        <button onClick={submitPsychometric} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-all">
                            Submit Profile & Continue
                        </button>
                    )}
                    {stage === 'mcq' && (
                        <button onClick={submitMCQ} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-all">
                            Submit MCQ & Continue
                        </button>
                    )}
                    {stage === 'coding' && (
                        <button onClick={submitFinalAssessment} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50">
                            {isSubmitting ? <CheckCircle2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Submit Final Assessment
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden">
                {stage === "psychometric" && (
                    <div className="max-w-4xl mx-auto glass-card rounded-xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-4">
                        <PsychometricSection onChange={setPsychometricData} />
                    </div>
                )}

                {stage === "mcq" && (
                    <div className="max-w-4xl mx-auto">
                        <MCQSection onChange={setMcqScore} questions={assessmentConfig?.mcq} />
                    </div>
                )}

                {stage === "coding" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
                        <div className="lg:col-span-1 glass-card rounded-xl p-6 overflow-y-auto">
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2 text-muted-foreground">Select Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        const newLang = e.target.value as "javascript" | "python" | "java";
                                        setLanguage(newLang);
                                        setCode(templates[newLang]);
                                    }}
                                    className="w-full bg-background border border-border rounded-lg p-2 text-sm"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                </select>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">{assessmentConfig?.coding?.title || "Problem: Two Sum"}</h2>
                            <div className="prose prose-invert max-w-none">
                                {assessmentConfig?.coding ? (
                                    <div className="whitespace-pre-wrap">{assessmentConfig.coding.problemStatement}</div>
                                ) : (
                                    <>
                                        <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
                                        <p>You may assume that each input would have exactly one solution.</p>
                                        <h3>Example 1:</h3>
                                        <pre className="bg-muted p-2 rounded-md">Input: nums = [2,7,11,15], target = 9{"\n"}Output: [0,1]</pre>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 h-full">
                            <CodeEditor
                                initialCode={code}
                                language={language}
                                onChange={(newCode) => setCode(newCode || "")}
                                onRun={runCode}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Camera Proctoring with Red Flag Counter */}
            {/* Pass proctoring prop */}
            <CameraProctor onViolationsChange={setProctoringViolations} proctoring={proctoring} />
        </div>
    );
}
