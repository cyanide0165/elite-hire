import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TopBar() {
    return (
        <header className="flex items-center justify-between py-4 mb-8 bg-transparent">
            {/* Global Search */}
            <div className="relative w-96">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/50">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    className="w-full bg-card/40 border border-white/5 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20 text-foreground placeholder-muted-foreground/50 transition-all shadow-sm"
                    placeholder="Search for jobs, candidates, or skills..."
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-background"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none">Alex Morgan</p>
                        <p className="text-xs text-muted-foreground mt-1">Senior Recruiter</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[1px] shadow-lg shadow-primary/20">
                        <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden relative">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
