
/**
 * Rule-Based Resume Analysis
 * Extracts structured data from resume text using pattern matching
 */

interface ResumeAnalysis {
    matchScore: number;
    skills: string[];
    experienceYears: number;
    summary: string;
    shortlisted: boolean;
}

/**
 * Extract skills from resume text
 */
function extractSkills(text: string): string[] {
    const commonSkills = [
        "React", "Angular", "Vue", "Next.js", "TypeScript", "JavaScript",
        "Node.js", "Express", "Python", "Java", "Spring Boot", "Django",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
        "Microservices", "REST", "GraphQL", "Git", "Jenkins",
        "Jest", "Cypress", "Kafka", "OAuth2", "JWT", "HTML5", "CSS3",
        "Tailwind", "Redux", "Webpack", "Vite", "gRPC", "D3.js"
    ];

    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of commonSkills) {
        // Match whole words or with dots/dashes
        const pattern = new RegExp(`\\b${skill.toLowerCase().replace(/\./g, '\\.')}\\b`, 'i');
        if (pattern.test(lowerText)) {
            foundSkills.push(skill);
        }
    }

    return [...new Set(foundSkills)]; // Remove duplicates
}

/**
 * Extract years of experience from resume
 */
function extractExperience(text: string): number {
    // Look for patterns like "7+ years", "7 years of experience", etc.
    const patterns = [
        /(\d+)\+?\s*years?\s+of\s+experience/i,
        /(\d+)\+?\s*years?\s+experience/i,
        /experience[:\s]+(\d+)\+?\s*years?/i,
        /with\s+(\d+)\+?\s*years/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return parseInt(match[1]);
        }
    }

    // Try to extract from date ranges (e.g., "January 2022 – Present")
    const dateRanges = text.match(/(\d{4})\s*[-–—]\s*(present|\d{4})/gi);
    if (dateRanges && dateRanges.length > 0) {
        let totalYears = 0;
        const currentYear = new Date().getFullYear();

        for (const range of dateRanges) {
            const match = range.match(/(\d{4})\s*[-–—]\s*(present|\d{4})/i);
            if (match) {
                const startYear = parseInt(match[1]);
                const endYear = match[2].toLowerCase() === 'present' ? currentYear : parseInt(match[2]);
                totalYears += (endYear - startYear);
            }
        }

        return Math.min(totalYears, 20); // Cap at 20 years
    }

    return 0;
}

/**
 * Generate analysis using rule-based extraction
 */
/**
 * Dynamic Job-Specific Analysis
 * Extracts keywords from Job Description and matches against Resume
 */
export async function generateAnalysis(
    systemPrompt: string,
    userPrompt: string,
    jsonMode: boolean = true
): Promise<ResumeAnalysis> {

    console.log("=== SMART RESUME ANALYSIS ===");

    // 1. Extract inputs
    // Expected userPrompt format: "Job: ... Requirements: ... Resume: ..."
    const jobMatch = userPrompt.match(/Job:\s*(.+?)\n/i);
    const reqMatch = userPrompt.match(/Requirements:\s*([\s\S]+?)\n\nResume:/i);
    const resumeMatch = userPrompt.match(/Resume:\s*([\s\S]+)/i);

    const jobTitle = jobMatch ? jobMatch[1].trim() : "General Role";
    const jobReqs = reqMatch ? reqMatch[1].trim() : "";
    const resumeText = resumeMatch ? resumeMatch[1] : userPrompt;

    // 2. Dynamic Keyword Extraction from Job Description & Requirements
    // Strategy: Look for capitalized words, technical terms, and phrases
    // We combine title + requirements for the source of truth
    const sourceText = `${jobTitle} ${jobReqs}`;

    // Stop words to ignore
    const stopWords = new Set(["the", "and", "or", "in", "on", "at", "to", "for", "with", "a", "an", "is", "are", "of", "be", "will", "can", "must", "have", "has", "role", "work", "job", "candidate", "experience", "years", "skills", "ability", "knowledge", "proficient", "familiar", "strong", "excellent", "good"]);

    // Simple tokenizer
    const potentialKeywords = sourceText.match(/\b[A-Za-z0-9+#.]+\b/g) || [];

    // Filter and count frequency to find important terms
    const keywordMap = new Map<string, number>();
    potentialKeywords.forEach(word => {
        const clean = word.replace(/[.,]/g, "");
        const lower = clean.toLowerCase();
        if (clean.length > 2 && !stopWords.has(lower) && !/^\d+$/.test(clean)) {
            // Give higher weight to capitalized words in middle of sentences (heuristics)
            // For now, just count everything not in stop list
            keywordMap.set(lower, (keywordMap.get(lower) || 0) + 1);
        }
    });

    // Select top keywords (top 30 by frequency or uniqueness)
    // For this simple version, we take unique words that appear in JD
    const targetKeywords = Array.from(keywordMap.keys());
    console.log(`Extracted ${targetKeywords.length} keywords from JD`);

    // 3. Match against Resume
    const resumeLower = resumeText.toLowerCase();
    const matchedKeywords: string[] = [];

    targetKeywords.forEach(kw => {
        // Full word match to avoid substring false positives (e.g., "java" in "javascript")
        // Escape special chars for regex
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
        if (pattern.test(resumeLower)) {
            matchedKeywords.push(kw);
        }
    });

    const matchCount = matchedKeywords.length;
    const totalTarget = targetKeywords.length || 1;

    // 4. Calculate Score
    // Formula: (Percentage of keywords matched * 0.7) + (Experience Bonus * 0.3)
    let keywordScore = (matchCount / totalTarget) * 100;

    // Boost score if key phrases are found
    // If JD has very few keywords, matching them is worth more? Adjust logic:
    // Basic Jaccard index-ish approach
    keywordScore = Math.min(keywordScore * 1.5, 100); // give 1.5x boost to be generous

    const experienceYears = extractExperience(resumeText);
    let expScore = Math.min(experienceYears * 10, 100); // 10 years = 100pts

    // Weighted Average
    const finalScore = Math.round((keywordScore * 0.7) + (expScore * 0.3));

    console.log(`Matched ${matchCount}/${totalTarget} keywords. Exp: ${experienceYears}yr. Final: ${finalScore}`);

    return {
        matchScore: finalScore,
        skills: matchedKeywords.slice(0, 10), // Return top 10 matched skills as "Skills"
        experienceYears,
        summary: `Matched ${matchCount} key terms from job description.`,
        shortlisted: finalScore >= 60
    };
}
