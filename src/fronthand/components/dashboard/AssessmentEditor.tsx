"use client";

import { useState } from "react";
import { Save, Code, CheckSquare, Brain, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AssessmentEditorProps {
    job: any;
}

export default function AssessmentEditor({ job }: AssessmentEditorProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"coding" | "mcq" | "psychometric">("coding");
    const [isSaving, setIsSaving] = useState(false);

    // Parse initial state or defaults
    const [codingConfig, setCodingConfig] = useState(job.codingDetails ? JSON.parse(job.codingDetails) : {
        title: "Two Sum",
        problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        initialCode: "function twoSum(nums, target) {\n  // Your code here\n}",
        testCases: [{ input: "[2,7,11,15], 9", output: "[0,1]" }]
    });

    const [mcqConfig, setMcqConfig] = useState(job.mcqDetails ? JSON.parse(job.mcqDetails) : [
        { question: "What is the complexity of binary search?", options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"], correctIndex: 1 }
    ]);

    const [psychometricConfig, setPsychometricConfig] = useState(job.psychometricDetails ? JSON.parse(job.psychometricDetails) : {
        enabled: true,
        passingScore: 40,
        traits: ["resilience", "teamwork", "leadership"]
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/jobs/${job.id}/assessment`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codingDetails: JSON.stringify(codingConfig),
                    mcqDetails: JSON.stringify(mcqConfig),
                    psychometricDetails: JSON.stringify(psychometricConfig),
                }),
            });

            if (res.ok) {
                router.refresh();
                alert("Assessment configuration saved successfully!");
            } else {
                alert("Failed to save configuration.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving configuration.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl sticky top-4 z-10 shadow-sm">
                <div className="flex gap-2 p-1 bg-muted/40 rounded-lg">
                    {[
                        { id: "coding", icon: Code, label: "Coding Challenge" },
                        { id: "mcq", icon: CheckSquare, label: "Aptitude (MCQ)" },
                        { id: "psychometric", icon: Brain, label: "Psychometric" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="glass-card p-6 rounded-xl min-h-[500px]">
                {activeTab === "coding" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid gap-4">
                            <label className="block">
                                <span className="text-sm font-medium text-muted-foreground">Challenge Title</span>
                                <input
                                    type="text"
                                    value={codingConfig.title}
                                    onChange={e => setCodingConfig({ ...codingConfig, title: e.target.value })}
                                    className="mt-1 w-full bg-background border border-border rounded-lg p-2"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-muted-foreground">Problem Statement (Markdown supported)</span>
                                <textarea
                                    value={codingConfig.problemStatement}
                                    onChange={e => setCodingConfig({ ...codingConfig, problemStatement: e.target.value })}
                                    className="mt-1 w-full h-32 bg-background border border-border rounded-lg p-2"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-muted-foreground">Initial Code Template</span>
                                <textarea
                                    value={codingConfig.initialCode}
                                    onChange={e => setCodingConfig({ ...codingConfig, initialCode: e.target.value })}
                                    className="mt-1 w-full h-32 font-mono text-sm bg-black/20 border border-border rounded-lg p-2"
                                />
                            </label>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Test Cases</span>
                                    <button
                                        onClick={() => setCodingConfig({ ...codingConfig, testCases: [...codingConfig.testCases, { input: "", output: "" }] })}
                                        className="text-xs flex items-center gap-1 text-primary hover:underline"
                                    >
                                        <Plus className="w-3 h-3" /> Add Case
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {codingConfig.testCases.map((tc: any, i: number) => (
                                        <div key={i} className="flex gap-4 items-start bg-muted/20 p-3 rounded-lg">
                                            <div className="grid grid-cols-2 gap-4 flex-1">
                                                <input
                                                    placeholder="Input (e.g. [2,7], 9)"
                                                    value={tc.input}
                                                    onChange={e => {
                                                        const newCases = [...codingConfig.testCases];
                                                        newCases[i].input = e.target.value;
                                                        setCodingConfig({ ...codingConfig, testCases: newCases });
                                                    }}
                                                    className="bg-background border border-border rounded p-2 text-sm"
                                                />
                                                <input
                                                    placeholder="Expected Output (e.g. [0,1])"
                                                    value={tc.output}
                                                    onChange={e => {
                                                        const newCases = [...codingConfig.testCases];
                                                        newCases[i].output = e.target.value;
                                                        setCodingConfig({ ...codingConfig, testCases: newCases });
                                                    }}
                                                    className="bg-background border border-border rounded p-2 text-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newCases = codingConfig.testCases.filter((_: any, idx: number) => idx !== i);
                                                    setCodingConfig({ ...codingConfig, testCases: newCases });
                                                }}
                                                className="text-muted-foreground hover:text-red-500 p-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "mcq" && (
                    <div className="space-y-6 animate-in fade-in">
                        {mcqConfig.map((q: any, i: number) => (
                            <div key={i} className="bg-muted/20 p-4 rounded-xl border border-border/50 relative group">
                                <button
                                    onClick={() => setMcqConfig(mcqConfig.filter((_: any, idx: number) => idx !== i))}
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="space-y-3">
                                    <input
                                        value={q.question}
                                        onChange={e => {
                                            const newConfig = [...mcqConfig];
                                            newConfig[i].question = e.target.value;
                                            setMcqConfig(newConfig);
                                        }}
                                        className="w-full bg-transparent border-0 border-b border-border focus:ring-0 px-0 text-lg font-medium placeholder:text-muted-foreground"
                                        placeholder="Enter Question..."
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt: string, optIdx: number) => (
                                            <div key={optIdx} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`q-${i}`}
                                                    checked={q.correctIndex === optIdx}
                                                    onChange={() => {
                                                        const newConfig = [...mcqConfig];
                                                        newConfig[i].correctIndex = optIdx;
                                                        setMcqConfig(newConfig);
                                                    }}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <input
                                                    value={opt}
                                                    onChange={e => {
                                                        const newConfig = [...mcqConfig];
                                                        newConfig[i].options[optIdx] = e.target.value;
                                                        setMcqConfig(newConfig);
                                                    }}
                                                    className={`flex-1 bg-background border ${q.correctIndex === optIdx ? 'border-green-500/50' : 'border-border'} rounded p-2 text-sm`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setMcqConfig([...mcqConfig, { question: "New Question", options: ["A", "B", "C", "D"], correctIndex: 0 }])}
                            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Add Question
                        </button>
                    </div>
                )}

                {activeTab === "psychometric" && (
                    <div className="space-y-6 animate-in fade-in max-w-lg">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-600 mb-6">
                            Psychometric profile settings determine the personality traits evaluated during the initial screening.
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <span className="font-medium">Enable Psychometric Screening</span>
                            <input
                                type="checkbox"
                                checked={psychometricConfig.enabled}
                                onChange={e => setPsychometricConfig({ ...psychometricConfig, enabled: e.target.checked })}
                                className="w-5 h-5 accent-primary"
                            />
                        </div>

                        <label className="block">
                            <span className="text-sm font-medium text-muted-foreground">Minimum Passing Score (%)</span>
                            <input
                                type="number"
                                value={psychometricConfig.passingScore}
                                onChange={e => setPsychometricConfig({ ...psychometricConfig, passingScore: parseInt(e.target.value) })}
                                className="mt-1 w-full bg-background border border-border rounded-lg p-2"
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
