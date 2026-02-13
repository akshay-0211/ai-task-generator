import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { dbService } from '../services/db.service';
import { llmService } from '../services/llm.service';
import { generateMarkdown } from '../services/export.service';
import { GenerateSpecInput, UpdateTaskInput, MoveTaskInput } from '../types';


export async function specsRoutes(fastify: FastifyInstance): Promise<void> {
    const prisma = dbService.getClient();

    // Create new spec with LLM generation
    fastify.post<{ Body: GenerateSpecInput }>(
        '/api/specs',
        async (request: FastifyRequest<{ Body: GenerateSpecInput }>, reply: FastifyReply) => {
            try {
                const { goal, users, constraints, templateType } = request.body;

                // Validate required fields
                if (!goal || !users || !templateType) {
                    return reply.status(400).send({
                        error: 'Missing required fields: goal, users, and templateType are required',
                    });
                }

                // Generate spec using LLM
                const llmResponse = await llmService.generateSpec(
                    goal,
                    users,
                    constraints,
                    templateType
                );

                // Create spec in database
                const spec = await prisma.spec.create({
                    data: {
                        goal,
                        users,
                        constraints: constraints || null,
                        templateType,
                        userStories: {
                            create: llmResponse.user_stories.map((story, storyIndex) => ({
                                title: story.title,
                                description: story.description,
                                position: storyIndex,
                                tasks: {
                                    create: story.tasks.map((task, taskIndex) => ({
                                        title: task.title,
                                        description: task.description,
                                        groupName: task.group,
                                        position: taskIndex,
                                    })),
                                },
                            })),
                        },
                        risks: {
                            create: llmResponse.risks.map((risk) => ({
                                description: risk,
                            })),
                        },
                    },
                    include: {
                        userStories: {
                            include: {
                                tasks: true,
                            },
                        },
                        risks: true,
                    },
                });

                return reply.status(201).send(spec);
            } catch (error) {
                console.error('Error creating spec:', error);
                return reply.status(500).send({
                    error: error instanceof Error ? error.message : 'Failed to create specification',
                });
            }
        }
    );

    // Get last 5 specs
    fastify.get('/api/specs', async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const specs = await prisma.spec.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    goal: true,
                    templateType: true,
                    createdAt: true,
                },
            });

            return reply.send(specs);
        } catch (error) {
            console.error('Error fetching specs:', error);
            return reply.status(500).send({ error: 'Failed to fetch specifications' });
        }
    });

    // Get spec by ID with all details
    fastify.get<{ Params: { id: string } }>(
        '/api/specs/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const { id } = request.params;

                const spec = await prisma.spec.findUnique({
                    where: { id },
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
                    return reply.status(404).send({ error: 'Specification not found' });
                }

                return reply.send(spec);
            } catch (error) {
                console.error('Error fetching spec:', error);
                return reply.status(500).send({ error: 'Failed to fetch specification' });
            }
        }
    );

    // Update task
    fastify.put<{ Params: { id: string; taskId: string }; Body: UpdateTaskInput }>(
        '/api/specs/:id/tasks/:taskId',
        async (
            request: FastifyRequest<{ Params: { id: string; taskId: string }; Body: UpdateTaskInput }>,
            reply: FastifyReply
        ) => {
            try {
                const { taskId } = request.params;
                const { title, description } = request.body;

                if (!title && !description) {
                    return reply.status(400).send({ error: 'No fields to update' });
                }

                const task = await prisma.task.update({
                    where: { id: taskId },
                    data: {
                        ...(title && { title }),
                        ...(description && { description }),
                    },
                });

                return reply.send(task);
            } catch (error) {
                console.error('Error updating task:', error);
                return reply.status(500).send({ error: 'Failed to update task' });
            }
        }
    );

    // Move task up or down
    fastify.post<{ Params: { id: string; taskId: string }; Body: MoveTaskInput }>(
        '/api/specs/:id/tasks/:taskId/move',
        async (
            request: FastifyRequest<{ Params: { id: string; taskId: string }; Body: MoveTaskInput }>,
            reply: FastifyReply
        ) => {
            try {
                const { taskId } = request.params;
                const { direction } = request.body;

                if (direction !== 'up' && direction !== 'down') {
                    return reply.status(400).send({ error: 'Direction must be "up" or "down"' });
                }

                // Get current task
                const currentTask = await prisma.task.findUnique({
                    where: { id: taskId },
                });

                if (!currentTask) {
                    return reply.status(404).send({ error: 'Task not found' });
                }

                // Get all tasks in the same story
                const allTasks = await prisma.task.findMany({
                    where: { storyId: currentTask.storyId },
                    orderBy: { position: 'asc' },
                });

                const currentIndex = allTasks.findIndex((t) => t.id === taskId);

                if (currentIndex === -1) {
                    return reply.status(404).send({ error: 'Task not found in story' });
                }

                // Check if move is valid
                if (
                    (direction === 'up' && currentIndex === 0) ||
                    (direction === 'down' && currentIndex === allTasks.length - 1)
                ) {
                    return reply.status(400).send({ error: 'Cannot move task in that direction' });
                }

                // Swap positions
                const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
                const swapTask = allTasks[swapIndex];

                await prisma.$transaction([
                    prisma.task.update({
                        where: { id: currentTask.id },
                        data: { position: swapTask.position },
                    }),
                    prisma.task.update({
                        where: { id: swapTask.id },
                        data: { position: currentTask.position },
                    }),
                ]);

                return reply.send({ success: true });
            } catch (error) {
                console.error('Error moving task:', error);
                return reply.status(500).send({ error: 'Failed to move task' });
            }
        }
    );

    // Export spec as markdown
    fastify.get<{ Params: { id: string } }>(
        '/api/specs/:id/export',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const { id } = request.params;

                const markdown = await generateMarkdown(id);

                return reply
                    .header('Content-Type', 'text/markdown')
                    .header('Content-Disposition', `attachment; filename="spec-${id}.md"`)
                    .send(markdown);
            } catch (error) {
                console.error('Error exporting spec:', error);
                return reply.status(500).send({ error: 'Failed to export specification' });
            }
        }
    );
}
