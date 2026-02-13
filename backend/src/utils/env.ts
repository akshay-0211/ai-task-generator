export function validateEnv(): void {
    const required = ['DATABASE_URL', 'OPENAI_API_KEY'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
