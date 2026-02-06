"use client";

import { CheckCircle2, Mic, Camera, AlertTriangle, RefreshCw, View } from "lucide-react";
import { useEffect, useState } from "react";

interface SystemCheckProps {
    proctoring: any; // Using return type of useProctoring
    onReady: () => void;
}

export default function SystemCheck({ proctoring, onReady }: SystemCheckProps) {
    const { videoRef, startProctoring, state, audioLevel } = proctoring;
    const [audioCheck, setAudioCheck] = useState(false);
    const [cameraCheck, setCameraCheck] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(0);

    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

    useEffect(() => {
        // Request permission via startProctoring FIRST
        startProctoring().then(() => {
            // THEN enumerate devices to ensure labels are visible and all devices detected
            navigator.mediaDevices.enumerateDevices().then(devs => {
                const videoDevs = devs.filter(d => d.kind === 'videoinput');
                console.log("📸 Detected video devices:", videoDevs); // Debug log
                setDevices(videoDevs);
                if (videoDevs.length > 0) setSelectedDeviceId(videoDevs[0].deviceId);
            }).catch(err => console.error("Enumeration error:", err));
        });
    }, []);

    const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedDeviceId(id);
        startProctoring(id);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (audioLevel) {
                const level = Math.min(100, (audioLevel / 255) * 400);
                setCurrentAudio(level);
                if (level > 10) setAudioCheck(true);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [audioLevel]);

    useEffect(() => {
        if (state.isActive && videoRef.current?.srcObject) {
            setCameraCheck(true);
        }
    }, [state.isActive]);

    const allReady = cameraCheck && audioCheck;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left: Preview */}
                <div className="space-y-4">
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        {/* Camera Selector */}
                        {devices.length > 1 && (
                            <div className="absolute top-4 right-4 z-20">
                                <select
                                    value={selectedDeviceId}
                                    onChange={handleCameraChange}
                                    className="bg-black/60 text-white border border-white/20 rounded px-3 py-1.5 text-xs backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {devices.map((d, i) => (
                                        <option key={d.deviceId} value={d.deviceId} className="bg-gray-900">
                                            {d.label || `Camera ${i + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover mirror"
                        />

                        {/* Audio Meter */}
                        <div className="absolute bottom-4 left-4 right-4 h-2 bg-black/50 rounded-full overflow-hidden border border-white/20">
                            <div className="h-full bg-green-500 transition-all duration-100 ease-out" style={{ width: `${currentAudio}%` }} />
                        </div>
                    </div>
                </div>

                {/* Right: Checklist */}
                <div className="flex flex-col justify-center space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">System Check</h1>
                        <p className="text-muted-foreground">Mandatory device checks before assessment.</p>
                    </div>

                    <div className="space-y-3">
                        {/* Camera */}
                        <div className={`flex items-center gap-4 p-3 rounded-lg border ${cameraCheck ? "bg-green-500/10 border-green-500/50" : "bg-card border-border"}`}>
                            <div className={`p-2 rounded-full ${cameraCheck ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}><Camera className="w-5 h-5" /></div>
                            <div className="flex-1"><h3 className="font-semibold text-sm">Webcam</h3><p className="text-xs text-muted-foreground">{cameraCheck ? "Connected" : "Checking..."}</p></div>
                            {cameraCheck && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        </div>

                        {/* Mic */}
                        <div className={`flex items-center gap-4 p-3 rounded-lg border ${audioCheck ? "bg-green-500/10 border-green-500/50" : "bg-card border-border"}`}>
                            <div className={`p-2 rounded-full ${audioCheck ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}><Mic className="w-5 h-5" /></div>
                            <div className="flex-1"><h3 className="font-semibold text-sm">Microphone</h3><p className="text-xs text-muted-foreground">{audioCheck ? "Detected" : "Speak to test..."}</p></div>
                            {audioCheck && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            try { await document.documentElement.requestFullscreen(); } catch (e) { }
                            onReady();
                        }}
                        disabled={!allReady}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${allReady
                            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                    >
                        {allReady ? "Start Assessment" : "Complete Checks to Continue"}
                    </button>

                    <style jsx>{` .mirror { transform: scaleX(-1); } `}</style>
                </div>
            </div>
        </div>
    );
}
