export interface GenerateSpecInput {
    goal: string;
    users: string;
    constraints?: string;
    templateType: string;
}

export interface Task {
    title: string;
    description: string;
    group: string;
}

export interface UserStory {
    title: string;
    description: string;
    tasks: Task[];
}

export interface LLMResponse {
    user_stories: UserStory[];
    risks: string[];
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
}

export interface MoveTaskInput {
    direction: 'up' | 'down';
}

export interface HealthStatus {
    backend: boolean;
    database: boolean;
    llm: boolean;
    timestamp: string;
}
