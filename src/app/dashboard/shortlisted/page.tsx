import { getMongoDb } from "@/backhand/lib/mongo";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ShortlistedPage({ searchParams }: { searchParams?: { q?: string; page?: string } }) {
  // simple server-side auth: check admin_token cookie
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    redirect("/dashboard/admin/login");
  }

  const q = searchParams?.q || "";
  const page = parseInt(searchParams?.page || "1", 10) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  let items: any[] = [];
  let total = 0;

  try {
    const db = await getMongoDb();
    const col = db.collection("shortlisted_resumes");

    const filter: any = {};
    if (q && q.trim()) {
      const re = new RegExp(q.trim(), "i");
      filter.$or = [{ name: re }, { email: re }, { skills: re }];
    }

    total = await col.countDocuments(filter);
    items = await col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
  } catch (err) {
    console.error("Error fetching shortlisted resumes:", err);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Shortlisted Resumes</h2>
          <p className="text-sm text-muted-foreground">Recent candidates shortlisted by the AI gatekeeper.</p>
        </div>
        <div className="flex gap-2 items-center">
          <form method="get" action="/dashboard/shortlisted" className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Search name, email, skill" className="input px-3 py-2 rounded-md" />
            <button type="submit" className="btn">Search</button>
          </form>
          <a href={`/api/admin/shortlisted/export?q=${q ? encodeURIComponent(q) : ''}`} className="btn" download>CSV Export</a>
          <form method="post" action="/dashboard/admin/logout" className="inline">
            <button type="submit" className="btn">Logout</button>
          </form>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Match</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Skills</th>
              <th className="p-3">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No shortlisted resumes found.</td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it._id?.toString() ?? it.candidateId} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{it.name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{it.email}</td>
                  <td className="p-3">{it.matchScore ?? "-"}%</td>
                  <td className="p-3">{it.experienceYears ?? "-"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {(it.skills || []).slice(0, 6).map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-secondary rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{it.createdAt ? new Date(it.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link key={i} href={`/dashboard/shortlisted?page=${i + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`px-3 py-1 rounded ${i + 1 === page ? 'bg-primary text-white' : 'bg-card'}`}>
              {i + 1}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
