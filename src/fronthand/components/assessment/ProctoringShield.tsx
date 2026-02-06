"use client";

import { useEffect } from "react";
import { Camera, AlertTriangle, Eye, Mic } from "lucide-react";
// REMOVED: import { useProctoring } from "../../hooks/useProctoring";

interface ProctoringShieldProps {
    candidateId: string;
    proctoring: any;
}

export default function ProctoringShield({ candidateId, proctoring }: ProctoringShieldProps) {
    // Hook now passed from parent
    const { videoRef, state } = proctoring;

    // REMOVED: internal useEffect for startProctoring

    const isMonitoring = state.isActive;
    const hasViolation = state.currentStatus === 'VIOLATION';
    const isWarning = state.currentStatus === 'WARNING';

    // UI logic mirroring the existing one but using state from hook
    const borderColor = hasViolation ? "border-red-500/80" : isWarning ? "border-yellow-500/80" : "border-green-500/20";
    const statusColor = hasViolation
        ? { text: "text-red-400", bg: "bg-red-500", icon: "text-red-500" }
        : isWarning
            ? { text: "text-yellow-500", bg: "bg-yellow-500", icon: "text-yellow-500" }
            : { text: "text-green-500", bg: "bg-green-500", icon: "text-green-500" };

    const statusText = hasViolation
        ? "Violation Detected"
        : isWarning
            ? "Warning"
            : "Proctoring Active";

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md border border-red-500/30 p-4 rounded-xl shadow-2xl z-50 w-72 flex flex-col gap-3">
            {/* Header */}
            <div className={`flex items-center justify-between text-white border-b pb-2 ${borderColor}`}>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${statusColor.bg}`}></div>
                        <Eye className={`w-4 h-4 relative z-10 ${statusColor.icon}`} />
                    </div>
                    <div className="relative">
                        <div className={`absolute -inset-1 rounded-full animate-pulse opacity-50 ${isMonitoring ? "bg-green-500" : "bg-gray-500"}`}></div>
                        <Mic className={`w-3 h-3 relative z-10 ${isMonitoring ? "text-green-500" : "text-gray-500"}`} />
                    </div>
                    <span className={`font-bold text-xs uppercase tracking-wider ${statusColor.text}`}>
                        {statusText}
                    </span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">Live Feed</div>
            </div>

            {/* Video */}
            <div className="relative bg-black rounded-lg overflow-hidden border border-white/10 aspect-video">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
                {/* Overlay logic for No Face */}
                {!state.faceDetected && isMonitoring && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                        <div className="flex flex-col items-center">
                            <Camera className="w-8 h-8 text-red-500 mb-1 animate-pulse" />
                            <span className="text-red-500 font-bold text-xs shadow-black drop-shadow-md">No Face Detected</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Warnings */}
            {state.violations.length > 0 && (
                <div className="bg-red-950/50 rounded-md p-2 max-h-24 overflow-y-auto custom-scrollbar">
                    {state.violations.slice().reverse().map((v: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[10px] text-red-300 mb-1">
                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{v.type} at {new Date(v.timestamp).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
