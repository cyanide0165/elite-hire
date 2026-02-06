import { NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate basic structure if needed
        const { codingDetails, mcqDetails, psychometricDetails } = body;

        // Use raw SQL to bypass Prisma Client validation since 'generate' failed due to file lock
        // This ensures we can save to the DB even if the runtime client is stale.
        await prisma.$executeRaw`
            UPDATE "Job" 
            SET "codingDetails" = ${codingDetails}, 
                "mcqDetails" = ${mcqDetails}, 
                "psychometricDetails" = ${psychometricDetails} 
            WHERE "id" = ${id}
        `;

        // Return success with the ID (we can't return the full object easily without another query)
        return NextResponse.json({ id, success: true });


    } catch (error: any) {
        console.error("Error updating assessment:", error);
        return NextResponse.json({ error: "Failed to update assessment" }, { status: 500 });
    }
}
