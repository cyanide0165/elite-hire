"use client";

import { useState } from "react";

interface PsychometricSectionProps {
    onChange: (data: { scores: Record<string, number>; textResponse: string }) => void;
}

const SLIDERS = [
    { key: "resilience", label: "Resilience under pressure", min: "Give up easily", max: "Thrive on chaos" },
    { key: "teamwork", label: "Collaboration vs. Independence", min: "Solo flyer", max: "Team player" },
];

const Slider = ({ label, min, max, value, onChange }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between">
            <label className="font-medium">{label}</label>
            <span className="text-primary font-bold">{value}%</span>
        </div>
        <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-secondary rounded-lg cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min}</span>
            <span>{max}</span>
        </div>
    </div>
);

export default function PsychometricSection({ onChange }: PsychometricSectionProps) {
    const [scores, setScores] = useState<Record<string, number>>({ resilience: 50, teamwork: 50 });
    const [textResponse, setTextResponse] = useState("");

    const handleChange = (trait: string, value: number) => {
        const newScores = { ...scores, [trait]: value };
        setScores(newScores);
        onChange({ scores: newScores, textResponse });
    };

    const handleTextChange = (value: string) => {
        setTextResponse(value);
        onChange({ scores, textResponse: value });
    }

    return (
        <div className="space-y-8 p-6">
            <div>
                <h3 className="text-xl font-bold mb-2">Psychometric Profile</h3>
                <p className="text-muted-foreground mb-6">Rate your behavior in the following workplace scenarios.</p>

                <div className="space-y-6">
                    {SLIDERS.map(({ key, ...props }) => (
                        <Slider
                            key={key}
                            {...props}
                            value={scores[key]}
                            onChange={(e: any) => handleChange(key, parseInt(e.target.value))}
                        />
                    ))}
                </div>
            </div>

            <div className="border-t border-border pt-6">
                <h3 className="text-xl font-bold mb-4">Scenario Response</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4 text-sm italic">
                    "A project deadline is cut in half at the last minute. The team is stressed. As a developer, how do you handle the situation?"
                </div>
                <textarea
                    value={textResponse}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full min-h-[150px] p-4 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
            </div>
        </div>
    );
}
