import { useEffect, useRef, useState } from 'react';
import '@tensorflow/tfjs-backend-webgl';

// Interfaces
// REMOVED: 'PROHIBITED_OBJECT'
interface ProctoringViolation {
    type: 'TAB_SWITCH' | 'MANUAL_FLAG' | 'NO_FACE' | 'MULTIPLE_FACES' | 'LOOKING_AWAY' | 'BACKGROUND_MOTION' | 'LOUD_NOISE';
    timestamp: number;
    duration?: number;
    details?: string;
}

interface ProctoringState {
    isActive: boolean;
    violations: ProctoringViolation[];
    currentStatus: 'OK' | 'WARNING' | 'VIOLATION';
    faceDetected: boolean;
    faceCount: number;
    lookingAway: boolean;
    backgroundMotion: boolean;
    // REMOVED: objectDetected
}

// Global types for CDN loaded libraries
declare global {
    interface Window {
        tf: any;
        faceDetection: any;
    }
}

export function useProctoring() {
    const [state, setState] = useState<ProctoringState>({
        isActive: false,
        violations: [],
        currentStatus: 'OK',
        faceDetected: false,
        faceCount: 0,
        lookingAway: false,
        backgroundMotion: false,
    });

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const modelsLoadedRef = useRef(false);
    const detectionIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const noFaceStartRef = useRef<number | null>(null);
    const lookAwayStartRef = useRef<number | null>(null);
    const isActiveRef = useRef(false);

    // Audio
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const noiseStartRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null); // Store stream persistently
    const isRecordingRef = useRef(false); // Only flag violations when true

    // AI Models
    const faceDetectorRef = useRef<any>(null);

    // Motion detection
    const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const prevFrameRef = useRef<Uint8ClampedArray | null>(null);

    // Dynamic Script Loader
    const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = "anonymous";
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.body.appendChild(script);
        });
    };

    // Load models
    const loadModels = async () => {
        if (modelsLoadedRef.current) return true;

        try {
            console.log('📦 Loading Face Detection via CDN...');

            // 1. Load Scripts Sequentially
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.4.0/dist/tf.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/face-detection@1.0.2/dist/face-detection.min.js');

            await new Promise(r => setTimeout(r, 1000));

            const tf = window.tf;
            const faceDetection = window.faceDetection;

            if (!tf || !faceDetection) {
                console.error("Globals state:", { tf: !!tf, faceDetection: !!faceDetection });
                throw new Error("Face detection libraries failed to initialize.");
            }

            // 2. Initialize Backend
            await tf.setBackend('webgl');
            await tf.ready();
            console.log('✅ TFJS Backend Ready');

            // 3. Load Face Detector (MediaPipe Short Range)
            const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
            const detectorConfig = {
                runtime: 'tfjs',
                modelType: 'short',
                maxFaces: 3
            };
            const faceDetector = await faceDetection.createDetector(model, detectorConfig);
            faceDetectorRef.current = faceDetector;
            console.log('✅ Face Detector Loaded');

            modelsLoadedRef.current = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to load AI models:', error);
            return false;
        }
    };

    // Start camera
    const startProctoring = async (deviceId?: string) => {
        try {
            console.log('🎥 Starting camera & microphone...', deviceId ? `Device: ${deviceId}` : 'Default');

            // Reuse existing stream if valid AND deviceId matches (or isn't specified)
            // Ideally, if a specific device is requested, we should probably stop the old one and start the new one.
            if (deviceId && streamRef.current) {
                const currentTrack = streamRef.current.getVideoTracks()[0];
                const currentDevice = currentTrack.getSettings().deviceId;
                if (currentDevice !== deviceId) {
                    stopProctoring(); // Stop current if different
                }
            }

            // Reuse if active and no switch needed
            if (!deviceId && streamRef.current && streamRef.current.active) {
                if (videoRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                    await videoRef.current.play();
                }
                return;
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user',
                    deviceId: deviceId ? { exact: deviceId } : undefined
                },
                audio: true
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await new Promise<void>((resolve) => {
                    if (!videoRef.current) return resolve();
                    videoRef.current.onloadedmetadata = async () => {
                        await videoRef.current!.play();
                        resolve();
                    };
                });
            }

            // Setup Audio Context
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                    const audioContext = new AudioContext();
                    const analyser = audioContext.createAnalyser();
                    const microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    analyser.fftSize = 256;

                    audioContextRef.current = audioContext;
                    analyserRef.current = analyser;
                }
            } catch (e) {
                console.warn("Audio context setup failed:", e);
            }

            isActiveRef.current = true;
            setState(prev => ({ ...prev, isActive: true }));

            if (!motionCanvasRef.current) {
                const c = document.createElement('canvas');
                c.width = 128; c.height = 96;
                motionCanvasRef.current = c;
            }

            const loaded = await loadModels();
            if (loaded) startDetectionLoop();

        } catch (error) {
            console.error('❌ Camera/Audio error:', error);
            alert('Camera and Microphone permissions required.');
        }
    };

    // Motion Logic
    const detectMotion = (video: HTMLVideoElement) => {
        // Ensure video is ready and has dimensions
        if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return false;

        if (!motionCanvasRef.current) return false;
        const ctx = motionCanvasRef.current.getContext('2d');
        if (!ctx) return false;

        try {
            ctx.drawImage(video, 0, 0, 128, 96);
        } catch (e) {
            console.warn("Motion detection skipped frame:", e);
            return false;
        }
        const data = ctx.getImageData(0, 0, 128, 96).data;

        if (!prevFrameRef.current) {
            prevFrameRef.current = new Uint8ClampedArray(data);
            return false;
        }

        let changes = 0;
        const prev = prevFrameRef.current;
        for (let i = 0; i < data.length; i += 16) {
            if (Math.abs(data[i] - prev[i]) > 30) changes++;
        }
        prevFrameRef.current.set(data);
        return changes > (128 * 96 / 4) * 0.1;
    };

    const detectAudioLevel = (): number => {
        if (!analyserRef.current) return 0;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        return sum / bufferLength;
    };

    // Unified Loop
    const startDetectionLoop = () => {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

        detectionIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || !isActiveRef.current || videoRef.current.paused || !videoRef.current.videoWidth) return;

            try {
                const now = Date.now();

                // 1. Detect Faces
                let faces: any[] = [];
                if (faceDetectorRef.current) {
                    try {
                        faces = await faceDetectorRef.current.estimateFaces(videoRef.current);
                    } catch (e) {
                        // console.warn("Face detection skip:", e);
                    }
                }

                // 2. Motion
                const hasMotion = detectMotion(videoRef.current);
                const faceCount = faces.length;

                // 3. Audio
                const audioLevel = detectAudioLevel();
                const isLoud = audioLevel > 40; // Higher threshold for speech only

                // Update State
                setState(prev => ({
                    ...prev,
                    faceCount,
                    faceDetected: faceCount > 0,
                    backgroundMotion: hasMotion,
                    // Maintain violation status if recent
                    currentStatus: isRecordingRef.current && (prev.currentStatus === 'VIOLATION' && prev.violations.some(v => now - v.timestamp < 2000)) ? 'VIOLATION' : (isRecordingRef.current && prev.currentStatus === 'VIOLATION' ? 'OK' : prev.currentStatus)
                }));

                // Logic
                if (!isRecordingRef.current) {
                    noiseStartRef.current = null;
                    noFaceStartRef.current = null;
                    lookAwayStartRef.current = null;
                    return;
                }

                // Audio Violation
                if (isLoud) {
                    if (!noiseStartRef.current) noiseStartRef.current = now;
                    if (now - noiseStartRef.current > 800) { // Sustained for 0.8s
                        addViolation('LOUD_NOISE', now);
                        setState(p => ({ ...p, currentStatus: 'VIOLATION' }));
                    }
                } else {
                    noiseStartRef.current = null;
                }

                if (faceCount === 0) {
                    if (!noFaceStartRef.current) noFaceStartRef.current = now;
                    if (now - noFaceStartRef.current > 3000) {
                        addViolation('NO_FACE', now);
                        setState(p => ({ ...p, currentStatus: 'VIOLATION' }));
                    } else {
                        setState(p => ({ ...p, currentStatus: 'WARNING' }));
                    }
                } else if (faceCount > 1) {
                    addViolation('MULTIPLE_FACES', now);
                    setState(p => ({ ...p, currentStatus: 'VIOLATION' }));
                    noFaceStartRef.current = null;
                } else {
                    noFaceStartRef.current = null;
                    const keypoints = (faces[0] as any).keypoints;
                    if (keypoints && keypoints.length >= 4) {
                        const nose = keypoints.find((k: any) => k.name === 'noseTip') || keypoints[2];
                        const leftEye = keypoints.find((k: any) => k.name === 'leftEye') || keypoints[0];
                        const rightEye = keypoints.find((k: any) => k.name === 'rightEye') || keypoints[1];

                        if (nose && leftEye && rightEye) {
                            const eyeDist = Math.abs(rightEye.x - leftEye.x);
                            const midX = (leftEye.x + rightEye.x) / 2;
                            const ratio = Math.abs(nose.x - midX) / eyeDist;

                            if (ratio > 0.6) {
                                if (!lookAwayStartRef.current) lookAwayStartRef.current = now;
                                if (now - lookAwayStartRef.current > 3000) {
                                    addViolation('LOOKING_AWAY', now);
                                    setState(p => ({ ...p, currentStatus: 'VIOLATION', lookingAway: true }));
                                } else {
                                    setState(p => ({ ...p, currentStatus: 'WARNING', lookingAway: true }));
                                }
                            } else {
                                lookAwayStartRef.current = null;
                                setState(p => ({ ...p, lookingAway: false }));
                            }
                        }
                    }
                }

            } catch (err) {
                console.error("AI Loop Error:", err);
            }
        }, 500);
    };

    const addViolation = (type: ProctoringViolation['type'], timestamp: number, duration?: number, details?: string) => {
        setState(prev => {
            const last = prev.violations[prev.violations.length - 1];
            if (last && last.type === type && timestamp - last.timestamp < 3000) return prev;
            return {
                ...prev,
                violations: [...prev.violations, { type, timestamp, duration, details }]
            };
        });
    };

    const stopProctoring = () => {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
        if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        isActiveRef.current = false;
        setState(prev => ({ ...prev, isActive: false }));
    };

    useEffect(() => {
        return () => stopProctoring();
    }, []);

    useEffect(() => {
        const handleVis = () => { if (document.hidden && isActiveRef.current && isRecordingRef.current) addViolation('TAB_SWITCH', Date.now()); };
        document.addEventListener('visibilitychange', handleVis);
        return () => document.removeEventListener('visibilitychange', handleVis);
    }, []);

    return {
        state,
        videoRef,
        canvasRef,
        startProctoring,
        stopProctoring,
        startRecording: () => { isRecordingRef.current = true; },
        addManualViolation: () => addViolation('MANUAL_FLAG', Date.now()),
        getViolationLog: () => state.violations,
        audioLevel: detectAudioLevel(),
        mediaStream: streamRef.current
    };
}
