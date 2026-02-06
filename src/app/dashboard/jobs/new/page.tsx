"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        department: "Engineering", // Default or add field
        location: "Remote",      // Default or add field
        type: "Full-time",       // Default or add field
        description: "",
        requirements: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/dashboard/jobs");
                router.refresh();
            } else {
                alert("Failed to create job");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating job");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Link href="/dashboard/jobs" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
            </Link>

            <div className="glass-card p-8 rounded-xl border border-border">
                <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Job Title</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input
                                required
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder="e.g. Remote, New York, London"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg p-3 outline-none"
                            >
                                <option>Engineering</option>
                                <option>Design</option>
                                <option>Marketing</option>
                                <option>Product</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Employment Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg p-3 outline-none"
                            >
                                <option>Full-time</option>
                                <option>Contract</option>
                                <option>Part-time</option>
                                <option>Internship</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="Describe the role and responsibilities..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Requirements</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="List key skills and qualifications..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Link href="/dashboard/jobs" className="px-6 py-2 rounded-lg hover:bg-muted transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? "Posting..." : "Post Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
