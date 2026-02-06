'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LinkedInSearchModal } from './LinkedInSearchModal';
import { CandidateTable } from './CandidateTable';

interface LinkedInIntegrationProps {
    jobId: string;
}

export function LinkedInIntegration({ jobId }: LinkedInIntegrationProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCandidates = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/jobs/${jobId}/candidates`);
            // Filter for only SOURCED candidates or those from LinkedIn
            const sourced = res.data.data.filter((c: any) => c.linkedinId || c.status === 'SOURCED');
            setCandidates(sourced);
        } catch (err) {
            console.error('Failed to load sourced candidates', err);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    return (
        <div className="space-y-6 mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                        <span className="text-[#0077b5]">in</span> LinkedIn Sourcing
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Find and import candidates directly from LinkedIn Recruiter System Connect.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#0077b5] hover:bg-[#006097] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Find Candidates via LinkedIn
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            ) : (
                <CandidateTable data={candidates} />
            )}

            <LinkedInSearchModal
                jobId={jobId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSearchQueued={() => {
                    // Optimistic update or poll? For now just re-fetch after a delay
                    setTimeout(fetchCandidates, 3000);
                    alert('Search queued! Results will appear here shortly.');
                }}
            />
        </div>
    );
}
