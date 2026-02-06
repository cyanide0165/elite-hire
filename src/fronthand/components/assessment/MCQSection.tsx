"use client";

import { useState, useEffect } from "react";

interface MCQSectionProps {
    onChange: (score: number) => void;
    questions?: any[];
}

export default function MCQSection({ onChange, questions }: MCQSectionProps) {
    // Fallback if no specific questions provided
    const displayQuestions = questions && questions.length > 0 ? questions : Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        question: `Question ${i + 1}`,
        options: ["a", "b", "c", "d"],
        answer: "a",
        correctIndex: 0
    }));

    const [answers, setAnswers] = useState<Record<number, string>>({});

    useEffect(() => {
        let correctCount = 0;
        displayQuestions.forEach((q: any) => {
            // Check based on index (new schema) or string match (old schema fallback)
            const userAnswer = answers[q.id || displayQuestions.indexOf(q)];

            // If using index based check
            if (q.correctIndex !== undefined) {
                if (q.options[q.correctIndex] === userAnswer) {
                    correctCount++;
                }
            } else if (answers[q.id] === q.answer) { // Fallback
                correctCount++;
            }
        });
        const score = (correctCount / displayQuestions.length) * 100;
        onChange(score);
    }, [answers, onChange, displayQuestions]);

    const handleOptionChange = (questionId: number, option: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: option }));
    };

    return (
        <div className="space-y-8 p-6 glass-card rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 bg-background/50 backdrop-blur-md border border-border/50">
            <div>
                <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Multiple Choice Questions
                </h3>
                <p className="text-muted-foreground mb-6">Select the correct option for each question.</p>

                <div className="space-y-6">
                    <div className="space-y-6">
                        {displayQuestions.map((q: any, i: number) => (
                            <div key={q.id || i} className="p-4 rounded-lg bg-card/40 border border-border/50 hover:border-primary/30 transition-colors">
                                <p className="font-semibold mb-3 text-lg">{q.question}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((option: string) => (
                                        <label
                                            key={option}
                                            className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-all duration-200 ${answers[q.id || i] === option
                                                ? "bg-primary/20 border-primary"
                                                : "bg-background/50 border-border hover:bg-accent hover:border-accent-foreground/30"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${q.id || i}`}
                                                value={option}
                                                checked={answers[q.id || i] === option}
                                                onChange={() => handleOptionChange(q.id || i, option)}
                                                className="w-4 h-4 text-primary bg-background border-input focus:ring-primary"
                                            />
                                            <span className="uppercase text-sm font-medium">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
