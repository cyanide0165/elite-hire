
import { NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";

export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(jobs);
    } catch (error: any) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { title, department, location, type, description, requirements } = await request.json();

        const job = await prisma.job.create({
            data: {
                title,
                department,
                location,
                type,
                description,
                requirements,
            },
        });

        return NextResponse.json(job);
    } catch (error: any) {
        console.error("Error creating job:", error);
        return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }
}
