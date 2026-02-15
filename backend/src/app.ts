import Fastify from 'fastify';
import cors from '@fastify/cors';
import { specsRoutes } from './routes/specs.routes';
import { statusRoutes } from './routes/status.routes';
import { errorHandler } from './plugins/error-handler';

export async function buildApp() {
    const fastify = Fastify({
        logger: {
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        },
    });

    // Register plugins
    await fastify.register(cors, {
        origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:3000',
        credentials: true,
    });

    await fastify.register(errorHandler);

    // Register routes
    await fastify.register(specsRoutes);
    await fastify.register(statusRoutes);

    return fastify;
}
