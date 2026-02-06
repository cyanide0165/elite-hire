"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { useParams } from "next/navigation";

export default function MobileCameraPage() {
    const params = useParams();
    const id = params?.id as string;
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState("IDLE"); // IDLE, CONNECTING, CONNECTED, ERROR
    const [stream, setStream] = useState<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    // 1. Initialize Camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }, // Rear camera
                    audio: false
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setStatus("READY_TO_CONNECT");
            } catch (err) {
                console.error("Camera Error:", err);
                setStatus("CAMERA_ERROR");
                alert("Could not access rear camera. Please allow permissions.");
            }
        };
        startCamera();
    }, []);

    // 2. WebRTC Connection Logic
    const connectToDesktop = async () => {
        if (!stream || !id) return;
        setStatus("CONNECTING");

        try {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            peerConnection.current = pc;

            // Add tracks
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // ICE Candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignal("CANDIDATE", event.candidate);
                }
            };

            // Negotiation
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sendSignal("OFFER", offer);

            // Poll for Answer
            const pollInterval = setInterval(async () => {
                const res = await fetch(`/api/signal?candidateId=${id}&recipient=MOBILE`);
                const messages = await res.json();

                for (const msg of messages) {
                    const data = JSON.parse(msg.data);
                    if (msg.type === "ANSWER" && pc.signalingState !== "stable") {
                        await pc.setRemoteDescription(new RTCSessionDescription(data));
                        setStatus("CONNECTED");
                        clearInterval(pollInterval); // Stop polling once connected (simplified)
                    }
                }
            }, 1000);

        } catch (err) {
            console.error("Connection Error:", err);
            setStatus("ERROR");
        }
    };

    const sendSignal = async (type: string, data: any) => {
        await fetch("/api/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                candidateId: id,
                type,
                sender: "MOBILE",
                data
            })
        });
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Mobile Proctor</h1>
                    <p className="text-gray-400 text-sm">Secure Environment Monitor</p>
                </div>

                <div className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-800 shadow-2xl">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />

                    {/* Status Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${status === "CONNECTED" ? "bg-green-500/80" :
                                status === "CONNECTING" ? "bg-yellow-500/80" : "bg-red-500/80"
                            }`}>
                            {status === "CONNECTED" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {status}
                        </div>
                    </div>
                </div>

                {status === "READY_TO_CONNECT" && (
                    <button
                        onClick={connectToDesktop}
                        className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 animate-bounce"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Start Streaming
                    </button>
                )}

                {status === "CONNECTED" && (
                    <div className="text-center text-green-400 animate-pulse">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                        <p>Streaming Active. Keep this tab open.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
