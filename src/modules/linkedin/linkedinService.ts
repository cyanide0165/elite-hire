import prisma from '@/backhand/lib/db'; // Corrected import path
import { linkedinClient } from './linkedinClient';

// Remove fallback PrismaClient instantiation which causes issues
// import { PrismaClient } from '@prisma/client';
// const db = new PrismaClient(); 
const db = prisma;

interface SearchCriteria {
    skills: string[];
    location?: string;
    experienceYears?: number;
    limit?: number;
}

export class LinkedInService {
    static async searchAndStoreCandidates(jobId: string, criteria: SearchCriteria) {
        try {
            console.log(`[LinkedInService] Searching for Job ${jobId} with criteria:`, criteria);

            let candidates = [];

            try {
                // 1. Call LinkedIn RSC API (Simulated endpoint)
                if (!process.env.LINKEDIN_CLIENT_ID) {
                    throw new Error('Missing LinkedIn Credentials - Switching to Mock Mode');
                }

                const response = await linkedinClient.post('/rsc/candidates/search', {
                    keywords: criteria.skills.join(' OR '),
                    location: criteria.location || 'Chennai, India',
                    experience: criteria.experienceYears,
                    count: criteria.limit || 10
                });
                candidates = response.data.elements || [];
            } catch (apiError) {
                console.warn('[LinkedInService] API unavailable or missing creds. Generating MOCK candidates.');

                // Generate Mock Candidates
                const limit = criteria.limit || 5;
                for (let i = 0; i < limit; i++) {
                    candidates.push({
                        id: `mock-linkedin-${Date.now()}-${i}`,
                        firstName: `Mock Candidate`,
                        lastName: `${i + 1}`,
                        headline: `${criteria.skills[0] || 'Engineer'} | Open to work`,
                        publicProfileUrl: 'https://linkedin.com/in/mock',
                        summary: `Experienced professional with ${criteria.experienceYears || 2} years in ${criteria.skills.join(', ')}.`,
                    });
                }
            }

            // 2. Store in DB
            for (const candidate of candidates) {
                await db.candidate.upsert({
                    where: { linkedinId: candidate.id },
                    update: {
                        lastSynced: new Date(),
                        headline: candidate.headline,
                        // existing fields update
                    },
                    create: {
                        jobId: jobId, // Link to job
                        linkedinId: candidate.id,
                        name: `${candidate.firstName} ${candidate.lastName}`,
                        headline: candidate.headline,
                        skills: criteria.skills.join(', '), // SQLite CSV
                        profileUrl: candidate.publicProfileUrl,
                        experienceSummary: candidate.summary,
                        lastSynced: new Date(),
                        status: 'SOURCED',
                    }
                });
            }

            console.log(`[LinkedInService] Synced ${candidates.length} candidates.`);

        } catch (error) {
            console.error('[LinkedInService] Failed to search/store candidates:', error);
            throw error; // Let Queue handle retry
        }
    }

    static async getJobCandidates(jobId: string) {
        return db.candidate.findMany({
            where: { jobId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
