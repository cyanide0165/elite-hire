'use client';

import { useState } from 'react';
import { Briefcase, Linkedin } from 'lucide-react';

interface JobDetailsTabsProps {
    overview: React.ReactNode;
    linkedin: React.ReactNode;
}

export function JobDetailsTabs({ overview, linkedin }: JobDetailsTabsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'linkedin'>('overview');

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }
            `}
                    >
                        <Briefcase className="w-4 h-4" />
                        Overview & Applicants
                    </button>

                    <button
                        onClick={() => setActiveTab('linkedin')}
                        className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'linkedin'
                                ? 'border-[#0077b5] text-[#0077b5]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }
            `}
                    >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Sourcing
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {overview}
                    </div>
                )}
                {activeTab === 'linkedin' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {linkedin}
                    </div>
                )}
            </div>
        </div>
    );
}
