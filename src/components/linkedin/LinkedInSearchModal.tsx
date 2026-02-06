'use client';

import { useState } from 'react';
import axios from 'axios';

interface LinkedInSearchModalProps {
    jobId: string;
    isOpen: boolean;
    onClose: () => void;
    onSearchQueued: () => void;
}

export function LinkedInSearchModal({ jobId, isOpen, onClose, onSearchQueued }: LinkedInSearchModalProps) {
    const [skills, setSkills] = useState('');
    const [location, setLocation] = useState('Chennai, India'); // Default from prompt
    const [experience, setExperience] = useState(2);
    const [limit, setLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.post('/api/linkedin/search', {
                jobId,
                criteria: {
                    skills: skills.split(',').map(s => s.trim()).filter(s => s),
                    location,
                    experienceYears: experience,
                    limit // Pass limit to API
                }
            });
            onSearchQueued();
            onClose();
        } catch (error: any) {
            console.error('Failed to queue search:', error);
            const errorMessage = error.response?.data?.error || 'Failed to start search. Please try again.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Find Candidates via LinkedIn</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Skills (comma separated)</label>
                        <input
                            type="text"
                            required
                            className="w-full border rounded p-2 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="React, Node.js, TypeScript"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Location</label>
                        <input
                            type="text"
                            required
                            className="w-full border rounded p-2 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Min. Experience (Years)</label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            className="w-full border rounded p-2 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={experience}
                            onChange={(e) => setExperience(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Max Candidates</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            className="w-full border rounded p-2 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Queuing...' : 'Search Candidates'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
