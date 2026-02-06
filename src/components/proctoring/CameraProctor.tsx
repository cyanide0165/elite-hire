"use client";

import { useEffect, useRef } from 'react';
import { AlertTriangle, Flag } from 'lucide-react';

interface CameraProctorProps {
    onViolationsChange?: (count: number) => void;
    proctoring: any; // Passed from parent
}

export function CameraProctor({ onViolationsChange, proctoring }: CameraProctorProps) {
    // Destructure from prop
    const { state, videoRef, addManualViolation, mediaStream } = proctoring;

    // Re-attach stream when component mounts or stream updates
    useEffect(() => {
        const video = videoRef.current;
        if (video && mediaStream && video.srcObject !== mediaStream) {
            video.srcObject = mediaStream;
            video.play().catch((e: any) => console.error("Play error:", e));
        }
    }, [mediaStream, videoRef]);

    useEffect(() => {
        if (onViolationsChange) {
            onViolationsChange(state.violations.length);
        }
    }, [state.violations.length, onViolationsChange]);

    const getStatusText = () => {
        if (!state.faceDetected) return 'No face detected';
        if (state.faceCount > 1) return `${state.faceCount} faces detected`;
        if (state.lookingAway) return 'Looking away';
        return 'Monitoring active';
    };

    return (
        <>
            {/* Violations Overlay */}
            {state.violations.length > 0 && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-red-600">
                        <Flag className="w-6 h-6 animate-pulse" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold tabular-nums">{state.violations.length}</span>
                            <span className="text-xs uppercase tracking-wider">
                                {state.violations.length > 0 ? state.violations[state.violations.length - 1].type.replace('_', ' ') : 'Violation'}
                            </span>
                        </div>
                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                </div>
            )}

            {/* Camera Feeds Container - Fixed Bottom Right */}
            <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-4">

                {/* Main Webcam Feed */}
                <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden w-64 group">
                    <div className="relative bg-black aspect-video">
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover mirror"
                            autoPlay
                            playsInline
                            muted
                        />
                        {/* Status Overlay */}
                        {getStatusText() !== 'Monitoring active' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 transition-all">
                                <div className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 animate-pulse">
                                    <AlertTriangle className="w-4 h-4" />
                                    {getStatusText()}
                                </div>
                            </div>
                        )}
                        {/* Audio Meter */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-300 ease-out"
                                style={{ width: `${Math.min(100, (proctoring.audioLevel || 0) * 2)}%` }}
                            />
                        </div>
                    </div>
                    {/* Status Bar */}
                    <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{getStatusText()}</span>
                            <button onClick={addManualViolation} className="text-red-500 hover:text-red-600 text-xs underline">Flag</button>
                        </div>
                        {state.isActive && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <div className="flex items-center gap-1"> <div className={`w-2 h-2 rounded-full ${state.faceDetected ? 'bg-green-500' : 'bg-red-500'}`} /> Face </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .mirror { transform: scaleX(-1); }
            `}</style>
        </>
    );
}
