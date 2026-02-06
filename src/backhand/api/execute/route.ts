import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { code, language } = await req.json();

        const pistonLang = language === "javascript" ? "javascript" : "python";
        const version = pistonLang === "javascript" ? "18.15.0" : "3.10.0";

        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: pistonLang,
                version: version,
                files: [
                    {
                        content: code,
                    },
                ],
            }),
        });

        const data = await response.json();

        if (data.run) {
            return NextResponse.json({
                output: data.run.stdout || data.run.stderr || "No output",
                error: data.run.stderr ? true : false
            });
        }

        return NextResponse.json({ output: "Execution failed" }, { status: 500 });
    } catch (error) {
        console.error("Execution error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
