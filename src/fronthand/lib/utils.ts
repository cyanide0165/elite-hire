import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const statusStyles = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
    const styles: Record<string, string> = {
        HIRED: "bg-green-500/10 text-green-500 border-green-500/20",
        SHORTLISTED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
        NO_HIRE: "bg-red-500/10 text-red-500 border-red-500/20",
        PENDING: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    return cn(base, styles[status] || styles.PENDING)
}

export const jobStatusStyles = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
    const styles: Record<string, string> = {
        Active: "bg-green-500/10 text-green-500 border-green-500/20",
        Closed: "bg-secondary text-secondary-foreground border-border",
        Draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    }
    return cn(base, styles[status] || styles.Draft)
}

export const navLinkStyles = (isActive: boolean) =>
    cn(
        "px-4 py-2 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
    )

export const tabStyles = (isActive: boolean) =>
    cn(
        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
        isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:bg-muted"
    )
