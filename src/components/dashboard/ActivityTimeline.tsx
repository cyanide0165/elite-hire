import React from 'react';
import { cn } from "../../fronthand/lib/utils";
import { CheckCircle2, UserPlus, FileText, Mail } from 'lucide-react';

const ACTIVITIES = [
    {
        id: 1,
        type: 'candidate_sourced',
        title: 'New Candidate Sourced',
        description: 'Sarah Jenkins was added to "Senior React Dev"',
        time: '10 mins ago',
        icon: UserPlus,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10'
    },
    {
        id: 2,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        description: 'Technical Round with Mike Chen',
        time: '2 hours ago',
        icon: FileText,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10'
    },
    {
        id: 3,
        type: 'email_sent',
        title: 'Outreach Sent',
        description: 'Follow-up email sent to 5 candidates',
        time: '5 hours ago',
        icon: Mail,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
    },
    {
        id: 4,
        type: 'status_change',
        title: 'Candidate Hired',
        description: 'Alex Rivera accepted offer for UX Design Lead',
        time: '1 day ago',
        icon: CheckCircle2,
        color: 'text-green-400',
        bg: 'bg-green-500/10'
    }
];

export default function ActivityTimeline() {
    return (
        <div className="glass-card p-6 rounded-2xl h-full animate-fade-up delay-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <button className="text-sm text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                <div className="relative pl-6 border-l border-border/40 space-y-8 ml-2">
                    {ACTIVITIES.map((activity, index) => (
                        <div key={activity.id} className="relative group">
                            {/* Dot */}
                            <div className={cn("absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-background ring-4 ring-card transition-all group-hover:scale-125", activity.bg.replace('/10', ''))}></div>

                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-secondary/50 px-2 py-0.5 rounded-full">{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Gradient Fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none rounded-b-2xl"></div>
        </div>
    );
}
