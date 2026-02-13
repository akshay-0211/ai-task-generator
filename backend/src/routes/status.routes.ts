import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { dbService } from '../services/db.service';
import { llmService } from '../services/llm.service';
import { HealthStatus } from '../types';

export async function statusRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.get('/api/status', async (_request: FastifyRequest, reply: FastifyReply) => {
        const status: HealthStatus = {
            backend: true,
            database: false,
            llm: false,
            timestamp: new Date().toISOString(),
        };

        try {
            // Check database
            status.database = await dbService.healthCheck();

            // Check LLM
            status.llm = await llmService.healthCheck();

            const allHealthy = status.backend && status.database && status.llm;

            return reply.status(allHealthy ? 200 : 503).send(status);
        } catch (error) {
            console.error('Health check error:', error);
            return reply.status(503).send(status);
        }
    });
}
