import { PrismaClient } from '@prisma/client';

class DatabaseService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    getClient(): PrismaClient {
        return this.prisma;
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }

    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
    }
}

export const dbService = new DatabaseService();
