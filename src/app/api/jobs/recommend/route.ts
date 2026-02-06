import { NextRequest, NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";
import { generateAnalysis } from "@/backhand/lib/ai";

export const maxDuration = 60; // Allow 60s for analysis loop

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        let resumeText = formData.get("text") as string | null;

        if (!file && !resumeText) {
            return NextResponse.json({ error: "No resume provided" }, { status: 400 });
        }

        // 1. Text Extraction
        if (file && !resumeText) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Handle PDF
            if (file.type === "application/pdf") {
                try {
                    const PDFParser = require("pdf2json");
                    const pdfParser = new PDFParser(null, 1);
                    resumeText = await new Promise((resolve, reject) => {
                        pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
                        pdfParser.on("pdfParser_dataReady", (pdfData: any) => resolve(pdfParser.getRawTextContent()));
                        pdfParser.parseBuffer(buffer);
                    });
                } catch (e) {
                    return NextResponse.json({ error: "PDF Parse Error" }, { status: 400 });
                }
            }
            // Handle DOCX
            else if (file.name.endsWith(".docx")) {
                try {
                    const mammoth = require("mammoth");
                    const result = await mammoth.extractRawText({ buffer });
                    resumeText = result.value || "";
                } catch (e) {
                    return NextResponse.json({ error: "DOCX Parse Error" }, { status: 400 });
                }
            }
            // Handle Text
            else {
                resumeText = buffer.toString("utf-8");
            }
        }

        if (!resumeText || resumeText.length < 50) {
            return NextResponse.json({ error: "Could not extract text from resume" }, { status: 400 });
        }

        // 2. Fetch Active Jobs
        const activeJobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to recent 20 for perf
        });

        // 3. Match against each job
        const matches = await Promise.all(activeJobs.map(async (job) => {
            const systemPrompt = "Analyze compatibility.";
            const userPrompt = `Job: ${job.title}\nRequirements: ${job.requirements}\n\nResume: ${resumeText}`;

            // Use existing robust AI logic
            const analysis = await generateAnalysis(systemPrompt, userPrompt);

            return {
                job,
                score: analysis.matchScore,
                reason: analysis.summary
            };
        }));

        // 4. Sort and Filter
        const topMatches = matches
            .filter(m => m.score > 20) // Filter out complete non-matches
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // Top 3

        return NextResponse.json({ matches: topMatches });

    } catch (error: any) {
        console.error("Match error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
