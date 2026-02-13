import 'dotenv/config';
import { buildApp } from './app';
import { dbService } from './services/db.service';
import { validateEnv } from './utils/env';

async function start() {
    try {
        // Validate environment variables
        validateEnv();

        const app = await buildApp();
        const port = parseInt(process.env.PORT || '3001', 10);
        const host = process.env.HOST || '0.0.0.0';

        await app.listen({ port, host });

        console.log(`Server listening on http://${host}:${port}`);

        // Graceful shutdown
        const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
        signals.forEach((signal) => {
            process.on(signal, async () => {
                console.log(`Received ${signal}, shutting down gracefully...`);
                await app.close();
                await dbService.disconnect();
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

start();
