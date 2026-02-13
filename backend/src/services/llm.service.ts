import OpenAI from 'openai';
import { z } from 'zod';
import { LLMResponse } from '../types';

// Zod schema for validating LLM response
const TaskSchema = z.object({
    title: z.string(),
    description: z.string(),
    group: z.string(),
});

const UserStorySchema = z.object({
    title: z.string(),
    description: z.string(),
    tasks: z.array(TaskSchema),
});

const LLMResponseSchema = z.object({
    user_stories: z.array(UserStorySchema),
    risks: z.array(z.string()),
});

class LLMService {
    private client: OpenAI;
    private model: string;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        const baseURL = process.env.OPENAI_BASE_URL;
        this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        this.client = new OpenAI({
            apiKey,
            baseURL: baseURL || undefined,
        });
    }

    async generateSpec(
        goal: string,
        users: string,
        constraints: string | undefined,
        templateType: string
    ): Promise<LLMResponse> {
        try {
            const prompt = this.buildPrompt(goal, users, constraints, templateType);

            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a product manager helping to create detailed project specifications. Always respond with valid JSON only, no additional text.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }

            // Parse and validate JSON
            const parsed = JSON.parse(content);
            const validated = LLMResponseSchema.parse(parsed);

            return validated;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('LLM response validation failed:', error.errors);
                throw new Error('Invalid response format from LLM');
            }
            console.error('LLM generation failed:', error);
            throw new Error('Failed to generate specification');
        }
    }

    private buildPrompt(
        goal: string,
        users: string,
        constraints: string | undefined,
        templateType: string
    ): string {
        return `Generate a detailed project specification for a ${templateType}.

Goal: ${goal}

Target Users: ${users}

${constraints ? `Constraints: ${constraints}` : ''}

Create a comprehensive specification with:
1. User stories that break down the goal into features
2. For each user story, create specific tasks grouped by category (e.g., "Frontend", "Backend", "Database", "Testing", "DevOps")
3. Identify potential risks

Respond with ONLY valid JSON in this exact format:
{
  "user_stories": [
    {
      "title": "User story title",
      "description": "Detailed description of the user story",
      "tasks": [
        {
          "title": "Task title",
          "description": "Task description",
          "group": "Category name (e.g., Frontend, Backend, Database)"
        }
      ]
    }
  ],
  "risks": [
    "Risk description 1",
    "Risk description 2"
  ]
}`;
    }

    async healthCheck(): Promise<boolean> {
        try {
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: 'Say "OK"' }],
                max_tokens: 5,
            });

            return completion.choices[0]?.message?.content !== undefined;
        } catch (error) {
            console.error('LLM health check failed:', error);
            return false;
        }
    }
}

export const llmService = new LLMService();
