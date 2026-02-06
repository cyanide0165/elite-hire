import { NextResponse } from "next/server";
import prisma from "@/backhand/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return new NextResponse("Candidate ID is required", { status: 400 });
        }

        // Use raw query to fetch binary data (bypassing stale client definition)
        const result = await prisma.$queryRaw<any[]>`
            SELECT "resumeData", "resumeType", "name" 
            FROM "Candidate" 
            WHERE "id" = ${id} 
            LIMIT 1
        `;

        if (!result || result.length === 0) {
            console.log("Resume API: No candidate found for id:", id);
            return new NextResponse("Resume not found", { status: 404 });
        }

        const candidate = result[0];

        if (!candidate.resumeData) {
            console.log("Resume API: Candidate found but no resumeData.");
            return new NextResponse("Resume file data missing", { status: 404 });
        }

        // In raw query results, Bytes might act differently depending on the driver, but usually Buffer or Uint8Array
        const buffer = candidate.resumeData;

        if (candidate.resumeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            try {
                const mammoth = require("mammoth");
                const { value: html } = await mammoth.convertToHtml({ buffer: buffer });

                // Wrap in a simple styled container
                const fullHtml = `
                    <html>
                    <head>
                        <style>
                            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #333; }
                            h1, h2, h3 { color: #111; }
                            p { margin-bottom: 1rem; }
                        </style>
                    </head>
                    <body>${html}</body>
                    </html>
                `;

                return new NextResponse(fullHtml, {
                    headers: {
                        "Content-Type": "text/html",
                        "Content-Disposition": "inline",
                    },
                });
            } catch (err) {
                console.error("Mammoth conversion failed:", err);
                // Fallback to download if conversion fails
            }
        }

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": candidate.resumeType || "application/pdf",
                // Strict inline. Note: if browsers see "application/octet-stream" or certain types, they might still download.
                "Content-Disposition": `inline; filename="${candidate.name.replace(/\s+/g, '_')}_resume${candidate.resumeType === 'application/pdf' ? '.pdf' : ''}"`,
            },
        });

    } catch (error: any) {
        console.error("Error fetching resume:", error);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
