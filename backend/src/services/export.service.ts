import { dbService } from './db.service';

export async function generateMarkdown(specId: string): Promise<string> {
    const prisma = dbService.getClient();

    const spec = await prisma.spec.findUnique({
        where: { id: specId },
        include: {
            userStories: {
                include: {
                    tasks: {
                        orderBy: { position: 'asc' },
                    },
                },
                orderBy: { position: 'asc' },
            },
            risks: true,
        },
    });

    if (!spec) {
        throw new Error('Spec not found');
    }

    let markdown = `# ${spec.templateType} Specification\n\n`;
    markdown += `**Generated:** ${spec.createdAt.toLocaleDateString()}\n\n`;
    markdown += `## Goal\n\n${spec.goal}\n\n`;
    markdown += `## Target Users\n\n${spec.users}\n\n`;

    if (spec.constraints) {
        markdown += `## Constraints\n\n${spec.constraints}\n\n`;
    }

    markdown += `## User Stories\n\n`;

    for (const story of spec.userStories) {
        markdown += `### ${story.title}\n\n`;
        markdown += `${story.description}\n\n`;

        if (story.tasks.length > 0) {
            // Group tasks by groupName
            const tasksByGroup = story.tasks.reduce((acc, task) => {
                if (!acc[task.groupName]) {
                    acc[task.groupName] = [];
                }
                acc[task.groupName].push(task);
                return acc;
            }, {} as Record<string, typeof story.tasks>);

            markdown += `#### Tasks\n\n`;

            for (const [groupName, tasks] of Object.entries(tasksByGroup)) {
                markdown += `**${groupName}:**\n\n`;
                for (const task of tasks) {
                    markdown += `- **${task.title}**: ${task.description}\n`;
                }
                markdown += `\n`;
            }
        }
    }

    if (spec.risks.length > 0) {
        markdown += `## Risks\n\n`;
        for (const risk of spec.risks) {
            markdown += `- ${risk.description}\n`;
        }
    }

    return markdown;
}
