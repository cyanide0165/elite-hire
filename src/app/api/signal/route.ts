import { NextRequest, NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";

// Force dynamic to avoid caching signal messages
export const dynamic = 'force-dynamic';

async function ensureSignalTable() {
    try {
        await prisma.$queryRaw`SELECT id FROM "SignalMessage" LIMIT 1`;
    } catch (e) {
        console.log("Creating SignalMessage table...");
        try {
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "SignalMessage" (
                    "id" TEXT NOT NULL PRIMARY KEY,
                    "candidateId" TEXT NOT NULL,
                    "type" TEXT NOT NULL,
                    "sender" TEXT NOT NULL,
                    "data" TEXT NOT NULL,
                    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
                )
            `);
        } catch (createError) {
            console.error("Failed to create SignalMessage table:", createError);
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        await ensureSignalTable();
        const body = await req.json();
        const { candidateId, type, sender, data } = body;

        if (!candidateId || !type || !sender || !data) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // We use raw insert because Prisma Client doesn't know about this table yet
        const id = crypto.randomUUID();
        await prisma.$executeRaw`
            INSERT INTO "SignalMessage" (id, "candidateId", type, sender, data, "createdAt")
            VALUES (${id}, ${candidateId}, ${type}, ${sender}, ${JSON.stringify(data)}, ${new Date()})
        `;

        return NextResponse.json({ success: true, id });

    } catch (error: any) {
        console.error("Signal Post Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await ensureSignalTable();
        const { searchParams } = new URL(req.url);
        const candidateId = searchParams.get("candidateId");
        const recipient = searchParams.get("recipient"); // 'DESKTOP' (me) wants messages FROM 'MOBILE'

        if (!candidateId) return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });

        // If I am DESKTOP, I want messages where sender = MOBILE
        // If I am MOBILE, I want messages where sender = DESKTOP
        const targetSender = recipient === 'DESKTOP' ? 'MOBILE' : 'DESKTOP';

        const messages = await prisma.$queryRaw`
            SELECT * FROM "SignalMessage" 
            WHERE "candidateId" = ${candidateId} 
            AND sender = ${targetSender}
            ORDER BY "createdAt" ASC
        `;

        // Cleanup old messages to keep table light (optional, maybe later)

        return NextResponse.json(messages);

    } catch (error: any) {
        console.error("Signal Get Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
