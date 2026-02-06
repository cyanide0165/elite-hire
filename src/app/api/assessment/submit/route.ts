import { NextRequest, NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";

export async function POST(req: NextRequest) {
    try {
        // Extract proctorLogs
        const { candidateId, technicalScore, psychometricScore, mcqScore, code, psychometricData, proctorLogs } = await req.json();

        await prisma.assessment.create({
            data: {
                candidateId,
                type: "TECHNICAL_PSYCHOMETRIC_MCQ",
                score: (technicalScore + psychometricScore + mcqScore) / 3,
                response: code,
                data: JSON.stringify(psychometricData),
            },
        });

        // Save Proctor Logs in Bulk
        if (proctorLogs && proctorLogs.length > 0) {
            await prisma.proctorLog.createMany({
                data: proctorLogs.map((log: any) => ({
                    candidateId,
                    eventType: log.type,
                    timestamp: new Date(log.timestamp),
                    details: log.details || "",
                }))
            });
        }

        const average = (technicalScore + psychometricScore + mcqScore) / 3;
        const finalDecision = average > 70 ? "HIRED" : "NO_HIRE";

        const rationale = `
      Technical Score: ${technicalScore}/100.
      Psychometric Score: ${psychometricScore}/100.
      MCQ Score: ${mcqScore}/100.
      Candidate demonstrated ${technicalScore > 80 ? "strong" : "average"} coding ability.
      Psychometric profile indicates ${psychometricData.resilience > 70 ? "high resilience" : "moderate resilience"}.
      Recommendation: ${finalDecision}.
      Proctoring: ${proctorLogs?.length || 0} violations recorded.
    `;

        await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                technicalScore,
                softSkillScore: psychometricScore,
                mcqScore,
                status: finalDecision,
                rationale: rationale,
            },
        });

        return NextResponse.json({ success: true, status: finalDecision });
    } catch (error: any) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: error.message || "Failed to submit" }, { status: 500 });
    }
}
