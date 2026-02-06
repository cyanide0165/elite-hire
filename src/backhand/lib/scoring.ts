
/**
 * Production-Ready Resume Scoring System
 * Specialized for Senior Full Stack Engineer role
 */

// Skill Normalization Map
export const SKILL_ALIASES: Record<string, string> = {
    "ReactJS": "React",
    "React.js": "React",
    "Node": "Node.js",
    "NodeJS": "Node.js",
    "Postgres": "PostgreSQL",
    "K8s": "Kubernetes",
    "AWS Lambda": "AWS",
    "EC2": "AWS",
    "S3": "AWS",
};

// Canonical Skills for Senior Full Stack Engineer
export const REQUIRED_SKILLS = {
    frontend: ["React", "Angular", "Vue", "Next.js"],
    backend: ["Node.js", "Java", "Python", "Spring Boot", "Express"],
    databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
    cloud: ["AWS", "Azure", "GCP", "Docker", "Kubernetes"],
    architecture: ["Microservices", "REST", "GraphQL", "Event-Driven"],
};

/**
 * Seniority Scoring Rubric (100-point system)
 */
export interface ScoringBreakdown {
    experienceDepth: number;      // 30 pts
    technicalBreadth: number;     // 25 pts
    impactEvidence: number;       // 20 pts
    leadershipSignals: number;    // 15 pts
    systemDesignMaturity: number; // 10 pts
    total: number;
}

export function calculateSeniorityScore(resumeData: any): ScoringBreakdown {
    const scores: ScoringBreakdown = {
        experienceDepth: 0,
        technicalBreadth: 0,
        impactEvidence: 0,
        leadershipSignals: 0,
        systemDesignMaturity: 0,
        total: 0,
    };

    // A. Experience Depth (30 pts)
    const years = resumeData.experienceYears || 0;
    if (years >= 10) scores.experienceDepth = 30;
    else if (years >= 7) scores.experienceDepth = 25;
    else if (years >= 5) scores.experienceDepth = 18;
    else scores.experienceDepth = Math.min(years * 3, 15);

    // B. Technical Breadth (25 pts)
    const skills = resumeData.skills || [];

    // Normalize input skills to lowercase
    const inputSkillsLower = skills.map((s: string) => s.toLowerCase());

    // Helper to check if any of the required skills (aliased) are present
    const hasSkillFromCategory = (categorySkills: string[]) => {
        return categorySkills.some(requiredSkill => {
            const requiredLower = requiredSkill.toLowerCase();
            // Check direct match
            if (inputSkillsLower.includes(requiredLower)) return true;
            // Check aliases (if input is an alias for required)
            // Reverse lookup: keys in SKILL_ALIASES that map to requiredSkill
            const aliases = Object.entries(SKILL_ALIASES)
                .filter(([_, value]) => value === requiredSkill)
                .map(([key, _]) => key.toLowerCase());

            return inputSkillsLower.some((s: string) => aliases.includes(s));
        });
    };

    let breadthScore = 0;
    const hasFrontend = hasSkillFromCategory(REQUIRED_SKILLS.frontend);
    const hasBackend = hasSkillFromCategory(REQUIRED_SKILLS.backend);
    const hasDatabase = hasSkillFromCategory(REQUIRED_SKILLS.databases);
    const hasCloud = hasSkillFromCategory(REQUIRED_SKILLS.cloud);
    const hasArchitecture = hasSkillFromCategory(REQUIRED_SKILLS.architecture);

    if (hasFrontend && hasBackend && hasDatabase) breadthScore += 15;
    if (hasCloud) breadthScore += 5;
    if (hasArchitecture) breadthScore += 5;
    scores.technicalBreadth = breadthScore;

    // C. Impact Evidence (20 pts)
    const summary = resumeData.summary || "";
    const hasMetrics = /\d+%|\d+x|reduced|improved|increased/i.test(summary);
    const hasScale = /\d{4,}\s*(users|requests|transactions)/i.test(summary);
    const hasOptimization = /optimiz|performance|latency|cost/i.test(summary);

    if (hasMetrics) scores.impactEvidence += 10;
    if (hasScale) scores.impactEvidence += 5;
    if (hasOptimization) scores.impactEvidence += 5;

    // D. Leadership Signals (15 pts)
    const hasLeadership = /led|mentored|architected|designed|owned/i.test(summary);
    const hasHiring = /interview|hiring|recruit/i.test(summary);
    const hasTeam = /team|cross-functional|collaborate/i.test(summary);

    if (hasLeadership) scores.leadershipSignals += 5;
    if (hasHiring) scores.leadershipSignals += 5;
    if (hasTeam) scores.leadershipSignals += 5;

    // E. System Design Maturity (10 pts)
    const hasSystemDesign = /microservices|distributed|scalab|architect/i.test(summary);
    const hasSecurity = /security|oauth|jwt|authentication/i.test(summary);

    if (hasSystemDesign) scores.systemDesignMaturity += 7;
    if (hasSecurity) scores.systemDesignMaturity += 3;

    // Calculate total
    scores.total =
        scores.experienceDepth +
        scores.technicalBreadth +
        scores.impactEvidence +
        scores.leadershipSignals +
        scores.systemDesignMaturity;

    return scores;
}

/**
 * Determine hiring decision
 */
export function getHiringDecision(score: number, jobTitle: string): {
    decision: "SHORTLISTED" | "REJECTED";
    level: string;
    rationale: string;
} {
    // Only apply strict scoring for Senior Full Stack Engineer
    if (jobTitle === "Senior Full Stack Engineer") {
        if (score >= 85) {
            return {
                decision: "SHORTLISTED",
                level: "Strong Senior",
                rationale: `Exceptional candidate with score ${score}/100. Demonstrates strong technical breadth, leadership, and impact.`
            };
        } else if (score >= 50) {
            return {
                decision: "SHORTLISTED",
                level: "Senior",
                rationale: `Solid senior candidate with score ${score}/100. Meets senior-level expectations.`
            };
        } else {
            return {
                decision: "REJECTED",
                level: "Below Senior",
                rationale: `Score ${score}/100 below senior threshold (50). Consider mid-level roles.`
            };
        }
    } else {
        // For other roles, use simpler threshold
        return {
            decision: score >= 50 ? "SHORTLISTED" : "REJECTED",
            level: score >= 50 ? "Qualified" : "Not Qualified",
            rationale: `Score: ${score}/100 for ${jobTitle}`
        };
    }
}
