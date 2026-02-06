import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect("/dashboard/admin/login");
  res.cookies.delete("admin_token");
  return res;
}
