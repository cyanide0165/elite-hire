"use client";

import { LogOut, Briefcase, BarChart2, Users, FileText, Linkedin, Settings, LayoutDashboard, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../fronthand/lib/utils";

const NAV_ITEMS = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/candidates", icon: Users, label: "Candidates" },
    { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
    { href: "/dashboard/linkedin", icon: Linkedin, label: "LinkedIn Sourcing" },
    { href: "/dashboard/assessments", icon: FileText, label: "Assessments" },
    { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-64 glass-panel rounded-2xl p-6 hidden md:flex flex-col justify-between z-50 transition-all duration-300">
            <div>
                <Link href="/dashboard" className="block mb-10">
                    <h1 className="text-2xl font-bold flex items-center gap-2 px-2 hover:opacity-80 transition-opacity">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-400 to-purple-400">
                            Elite Hire
                        </span>
                    </h1>
                </Link>
                <nav className="space-y-2">
                    {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    active
                                        ? "bg-primary/15 text-primary shadow-[0_0_20px_rgba(99,102,241,0.3)] font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                {active && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_currentColor]" />
                                )}
                                <Icon className={cn("w-5 h-5 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")} />
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-border/50 pt-6">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 mb-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
                    <Home className="w-5 h-5" />
                    Back to Home
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 mb-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
                    <Settings className="w-5 h-5" />
                    Settings
                </Link>
                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Link>
            </div>
        </aside>
    );
}
