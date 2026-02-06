import { NextRequest, NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";
import { generateAnalysis } from "@/backhand/lib/ai";



export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const jobId = formData.get("jobId") as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!jobId) {
            return NextResponse.json({ error: "Job selection is required" }, { status: 400 });
        }

        // Fetch Job Details
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return NextResponse.json({ error: "Invalid Job ID" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let resumeText = "";

        // Handle PDF
        if (file.type === "application/pdf") {
            try {
                // Use pdf2json instead of pdf-parse to avoid DOMMatrix/Canvas issues
                const PDFParser = require("pdf2json");
                const pdfParser = new PDFParser(null, 1); // 1 = text mode

                resumeText = await new Promise((resolve, reject) => {
                    pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
                    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                        // Extract text from raw data
                        resolve(pdfParser.getRawTextContent());
                    });

                    pdfParser.parseBuffer(buffer);
                });

                console.log("PDF parsed successfully (pdf2json), text length:", resumeText.length);
            } catch (pdfError) {
                console.error("PDF parsing error:", pdfError);
                return NextResponse.json({
                    error: "Failed to parse PDF. Please ensure it is a valid PDF file."
                }, { status: 400 });
            }
        }
        // Handle DOCX (Word)
        else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
            try {
                const mammoth = require("mammoth");
                const result = await mammoth.extractRawText({ buffer: buffer });
                resumeText = result.value || "";

                if (result.messages && result.messages.length > 0) {
                    console.log("Mammoth messages:", result.messages);
                }
                console.log("DOCX parsed successfully, text length:", resumeText.length);
            } catch (docxError) {
                console.error("DOCX parsing error:", docxError);
                return NextResponse.json({
                    error: "Failed to parse Word document. Please ensure it is a valid .docx file."
                }, { status: 400 });
            }
        }
        // Handle Plain Text
        else {
            resumeText = buffer.toString("utf-8");
        }

        console.log("=== UPLOAD API DEBUG ===");
        console.log("File type:", file.type);
        console.log("File name:", file.name);
        console.log("File size:", file.size);
        console.log("Resume text length:", resumeText.length);
        console.log("First 500 chars of resume:", resumeText.substring(0, 500));
        console.log("========================");

        // If PDF extraction failed (empty text), return helpful error
        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json({
                error: "Could not extract text from PDF. The file may be an image-based PDF or scanned document. Please use the 'Paste Text' option instead.",
                debug: {
                    fileType: file.type,
                    extractedLength: resumeText.length
                }
            }, { status: 400 });
        }

        const systemPrompt = "Analyze resume and output JSON.";
        const userPrompt = `Job: ${job.title}
Requirements: ${job.requirements}

Resume: ${resumeText.substring(0, 2000)}

Rate 0-100. Output JSON:
{"matchScore": 75, "skills": ["skill1", "skill2"], "experienceYears": 3, "summary": "brief reason", "shortlisted": true}`;

        let aiResponse = await generateAnalysis(systemPrompt, userPrompt);

        if (!aiResponse) {
            // Fallback if AI fails completely
            aiResponse = {
                matchScore: 0,
                skills: [],
                experienceYears: 0,
                summary: "AI Analysis Failed. Please try again.",
                shortlisted: false
            };
        }

        // Apply structured scoring for Senior Full Stack Engineer (Legacy / Premium Scoring)
        // For all other roles, we trust the new Dynamic AI Analysis (aiResponse)
        let finalScore = aiResponse.matchScore;
        let finalStatus = aiResponse.shortlisted ? "SHORTLISTED" : "REJECTED";
        let rationale = aiResponse.summary;

        if (job.title === "Senior Full Stack Engineer") {
            const { calculateSeniorityScore, getHiringDecision } = await import("@/backhand/lib/scoring");

            const scoringBreakdown = calculateSeniorityScore({
                experienceYears: aiResponse.experienceYears,
                skills: aiResponse.skills, // Note: these are now strictly matched keywords from JD
                summary: resumeText.substring(0, 2000)
            });

            const decision = getHiringDecision(scoringBreakdown.total, job.title);

            finalScore = scoringBreakdown.total;
            finalStatus = decision.decision;
            rationale = `${decision.rationale}\n\nBreakdown:\n- Experience: ${scoringBreakdown.experienceDepth}/30\n- Technical: ${scoringBreakdown.technicalBreadth}/25\n- Impact: ${scoringBreakdown.impactEvidence}/20\n- Leadership: ${scoringBreakdown.leadershipSignals}/15\n- System Design: ${scoringBreakdown.systemDesignMaturity}/10`;

            // Sync the AI response score with the actual decision score
            aiResponse.matchScore = finalScore;
            aiResponse.summary += `\n\n[HR System Note]: ${decision.rationale}`;
        }


        const timestamp = new Date().getTime().toString().slice(-4);

        // 1. Create candidate record using standard Prisma (stale client compliant for standard fields)
        const candidate = await prisma.candidate.create({
            data: {
                name: "Candidate " + timestamp,
                email: `candidate_${timestamp}@example.com`,
                resumeText: resumeText.substring(0, 5000),
                status: finalStatus,
                matchScore: finalScore,
                skills: JSON.stringify(aiResponse.skills),
                experienceYears: aiResponse.experienceYears || 0,
                rationale: rationale,
                jobId: jobId,
                // We will update resumeUrl and resumeData in the next step to avoid type errors with stale client
            },
        });

        // 2. Update with resume file data using Raw SQL (bypasses stale client validation)
        // We use $executeRaw to handle the binary data insert and new fields
        const resumeUrl = `/api/resume/${candidate.id}`;

        await prisma.$executeRaw`
            UPDATE "Candidate" 
            SET "resumeData" = ${buffer}, 
                "resumeType" = ${file.type},
                "resumeUrl" = ${resumeUrl}
            WHERE "id" = ${candidate.id}
        `;

        return NextResponse.json({
            status: candidate.status,
            candidateId: candidate.id,
            analysis: aiResponse,
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
