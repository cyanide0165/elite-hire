import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token && token === process.env.ADMIN_TOKEN) {
    redirect(searchParams?.next || "/dashboard/shortlisted");
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
      <form method="post" action="/api/admin/login" className="flex flex-col gap-3">
        <input name="token" placeholder="Admin token" className="input" />
        <button type="submit" className="btn">Sign in</button>
      </form>
    </div>
  );
}
