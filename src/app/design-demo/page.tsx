import React from "react";
import NeuralBackground from "@/components/ui/flow-field-background";
import { ArrowRight, Sparkles } from "lucide-react";

export default function NeuralHeroDemo() {
    return (
        // Container must have a defined height, or use h-screen
        <div className="relative w-full h-screen font-sans text-white">
            <NeuralBackground
                color="#818cf8" // Indigo-400
                trailOpacity={0.1} // Lower = longer trails
                speed={0.8}
                className="absolute inset-0 z-0"
            />

            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Modern AI Recruitment</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                    Recruit Smarter with <br /> Alpha Intelligence
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
                    Experience the next generation of hiring. Automated sourcing, intelligent screening,
                    and predictive analytics—all in a beautiful, calm interface.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 hover:scale-105 shadow-xl shadow-indigo-500/20">
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-300 transition-all bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white backdrop-blur-sm">
                        View Demo
                    </button>
                </div>
            </div>
        </div>
    );
}
