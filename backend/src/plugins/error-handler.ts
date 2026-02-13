import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export async function errorHandler(fastify: FastifyInstance): Promise<void> {
    fastify.setErrorHandler(
        (error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
            console.error('Error:', error);

            // Validation errors
            if (error.validation) {
                return reply.status(400).send({
                    error: 'Validation error',
                    details: error.validation,
                });
            }

            // Default error response
            const statusCode = error.statusCode || 500;
            return reply.status(statusCode).send({
                error: error.message || 'Internal server error',
            });
        }
    );
}

