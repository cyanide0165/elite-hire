
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const JOBS = [
    {
        title: 'Senior Full Stack Engineer',
        description: 'Lead the architecture and development of scalable full-stack applications.',
        requirements: 'React, Node.js, TypeScript, System Design, AWS',
    },
    {
        title: 'Product Designer',
        description: 'Design intuitive, user-centric interfaces and seamless user experiences.',
        requirements: 'Figma, UI/UX Principles, Prototyping, User Research',
    },
    {
        title: 'Marketing Manager',
        description: 'Develop and execute strategic marketing campaigns to drive growth.',
        requirements: 'SEO, Content Strategy, Analytics, Brand Management',
    },
    {
        title: 'DevOps Engineer',
        description: 'Manage cloud infrastructure, CI/CD pipelines, and system reliability.',
        requirements: 'Docker, Kubernetes, AWS, CI/CD, Terraform',
    }
]

async function main() {
    console.log('Start seeding...')

    // Cleanup old seed data if it exists
    const oldTitles = ['Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'AI/ML Engineer'];
    await prisma.job.deleteMany({
        where: {
            title: {
                in: oldTitles
            }
        }
    });
    console.log('Cleaned up old job roles.')

    for (const job of JOBS) {
        const existingJob = await prisma.job.findFirst({
            where: { title: job.title }
        })

        if (!existingJob) {
            const createdJob = await prisma.job.create({
                data: job,
            })
            console.log(`Created job with id: ${createdJob.id}`)
        } else {
            console.log(`Job "${job.title}" already exists.`)
        }
    }
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
