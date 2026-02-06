import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/backhand/lib/mongo";

function isAuthorized(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return token && token === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getMongoDb();
    const col = db.collection("shortlisted_resumes");
    const items = await col.find({}).sort({ createdAt: -1 }).limit(500).toArray();

    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    console.error("Admin shortlisted GET error:", err);
    return NextResponse.json({ success: false, error: err.message || "MongoDB error" }, { status: 500 });
  }
}
