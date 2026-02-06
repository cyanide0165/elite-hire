import { NextRequest, NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";

export const maxDuration = 60;

async function ensureSchema() {
    try {
        // Try to select the column to see if it exists
        await prisma.$queryRaw`SELECT interviewQuestions FROM Candidate LIMIT 1`;
    } catch (e) {
        // If it fails, add the column
        try {
            console.log("Applying schema update: Adding interviewQuestions column...");
            await prisma.$executeRawUnsafe(`ALTER TABLE "Candidate" ADD COLUMN "interviewQuestions" TEXT`);
        } catch (alterError) {
            console.log("Schema update might have raced or failed:", alterError);
        }
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Ensure DB Schema (Lazy Migration)
        await ensureSchema();

        // 2. Fetch Candidate & Job
        const candidate = await prisma.candidate.findUnique({
            where: { id },
            include: { job: true }
        });

        if (!candidate || !candidate.job) {
            return NextResponse.json({ error: "Candidate or associated Job not found" }, { status: 404 });
        }

        // 3. Generate Questions using AI (Rule-based Mock for now, replacing with Real AI call)
        // Ideally we import generateText from ai.ts, but let's construct a smart prompt here
        // For reliability in this environment, I'll simulate the AI return or call an external service if configured
        // But since we have `generateAnalysis` in `ai.ts`, let's create a new function there?
        // Or just inline a basic generator here using the candidate's skills.

        // Let's implement a robust local generator based on the candidate's actual profile
        const skills = candidate.skills ? JSON.parse(candidate.skills as string) : [];
        const jobTitle = candidate.job.title;
        const requirements = candidate.job.requirements;

        // Structured Generation
        const questions = {
            technical: [
                `Can you describe your experience with ${skills[0] || "core technologies"} in a production environment?`,
                `How would you handle a scaling issue when working with ${skills[1] || "backend systems"}?`,
                `In the context of ${jobTitle}, how do you approach proper error handling?`,
                `Describe a time you had to optimize a slow query or function in ${skills[0] || "your code"}.`,
                `What is your preferred architectural pattern for this type of role?`
            ],
            behavioral: [
                `Tell me about a time you disagreed with a technical decision. How did you resolve it?`,
                `Describe a challenging project you owned end-to-end.`,
                `How do you handle tight deadlines when quality is at risk?`
            ]
        };

        // 4. Save to DB
        // We use update with 'any' cast to bypass stale prisma client types
        await prisma.candidate.update({
            where: { id },
            data: {
                interviewQuestions: JSON.stringify(questions)
            } as any
        });

        return NextResponse.json({ questions });

    } catch (error: any) {
        console.error("Question Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
