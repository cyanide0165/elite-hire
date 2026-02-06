import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const token = formData.get("token");
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const res = NextResponse.redirect("/dashboard/shortlisted");
    res.cookies.set("admin_token", String(token), { path: "/", maxAge: 60 * 60 * 24 });
    return res;
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
