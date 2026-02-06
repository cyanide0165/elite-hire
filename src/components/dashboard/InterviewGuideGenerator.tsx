"use client";

import { useState } from "react";
import { Loader2, Sparkles, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface InterviewQuestions {
    technical: string[];
    behavioral: string[];
}

export default function InterviewGuideGenerator({
    candidateId,
    existingQuestions
}: {
    candidateId: string;
    existingQuestions: string | null; // JSON string
}) {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<InterviewQuestions | null>(
        existingQuestions ? JSON.parse(existingQuestions) : null
    );
    const [expanded, setExpanded] = useState(true);

    const generateQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/candidate/${candidateId}/questions`, {
                method: "POST"
            });
            const data = await res.json();
            if (res.ok) {
                setQuestions(data.questions);
                setExpanded(true);
            } else {
                alert("Failed to generate questions: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Network error generating questions");
        } finally {
            setLoading(false);
        }
    };

    if (!questions && !loading) {
        return (
            <div className="glass-card p-6 rounded-xl border border-primary/20 bg-primary/5 mt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            AI Interview Guide
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Generate a tailored interview script based on this candidate's profile.
                        </p>
                    </div>
                    <button
                        onClick={generateQuestions}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        Generate Questions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-xl border border-primary/20 bg-primary/5 mt-6 transition-all duration-500">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Interview Guide
                </h3>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                    expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>

            {loading ? (
                <div className="py-8 text-center text-muted-foreground animate-pulse">
                    Generating tailored questions...
                </div>
            ) : questions && expanded ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Technical Deep-Dive</h4>
                        <ul className="space-y-3">
                            {questions.technical.map((q, i) => (
                                <li key={i} className="bg-card/50 p-3 rounded-lg border border-border text-sm flex gap-3">
                                    <span className="font-mono text-primary/50 text-xs mt-0.5">{i + 1}.</span>
                                    <span>{q}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Behavioral & Culture</h4>
                        <ul className="space-y-3">
                            {questions.behavioral.map((q, i) => (
                                <li key={i} className="bg-card/50 p-3 rounded-lg border border-border text-sm flex gap-3">
                                    <span className="font-mono text-primary/50 text-xs mt-0.5">{i + 1}.</span>
                                    <span>{q}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button
                        onClick={generateQuestions}
                        className="text-xs text-primary hover:underline mt-2 w-full text-right"
                    >
                        Regenerate Guide
                    </button>
                </div>
            ) : null}
        </div>
    );
}
