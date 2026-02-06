import { NextResponse } from "next/server";
import { getMongoDb } from "@/backhand/lib/mongo";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";

    const db = await getMongoDb();
    const col = db.collection("shortlisted_resumes");

    const filter: any = {};
    if (q && q.trim()) {
      const re = new RegExp(q.trim(), "i");
      filter.$or = [{ name: re }, { email: re }, { skills: re }];
    }

    const items = await col.find(filter).sort({ createdAt: -1 }).toArray();

    const csvLines = [
      ["Name", "Email", "Match %", "Experience (Years)", "Skills", "Date Added"].join(","),
      ...items.map((it) => {
        const skillsList = (it.skills || []).join("; ");
        const createdAt = it.createdAt ? new Date(it.createdAt).toLocaleString() : "";
        return [
          `"${it.name || ""}"`,
          `"${it.email || ""}"`,
          it.matchScore || "-",
          it.experienceYears || "-",
          `"${skillsList}"`,
          `"${createdAt}"`,
        ].join(",");
      }),
    ];

    const csv = csvLines.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="shortlisted_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error("Error exporting CSV:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
