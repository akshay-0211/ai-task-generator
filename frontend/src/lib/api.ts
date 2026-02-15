// Runtime API URL detection for Railway deployment
const getApiUrl = () => {
    // In browser, check if we're on Railway production
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'mini-planning-tool.up.railway.app') {
            return 'https://ai-task-generator-production-a152.up.railway.app';
        }
    }
    // Fallback to env var or localhost
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();

export interface Spec {
    id: string;
    goal: string;
    users: string;
    constraints?: string;
    templateType: string;
    createdAt: string;
    userStories?: UserStory[];
    risks?: Risk[];
}

export interface UserStory {
    id: string;
    title: string;
    description: string;
    position: number;
    tasks: Task[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    groupName: string;
    position: number;
}

export interface Risk {
    id: string;
    description: string;
}

export interface CreateSpecInput {
    goal: string;
    users: string;
    constraints?: string;
    templateType: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
}

export const api = {
    async createSpec(input: CreateSpecInput): Promise<Spec> {
        const res = await fetch(`${API_URL}/api/specs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create specification');
        }

        return res.json();
    },

    async getSpecs(): Promise<Spec[]> {
        const res = await fetch(`${API_URL}/api/specs`);
        if (!res.ok) throw new Error('Failed to fetch specifications');
        return res.json();
    },

    async getSpec(id: string): Promise<Spec> {
        const res = await fetch(`${API_URL}/api/specs/${id}`);
        if (!res.ok) throw new Error('Failed to fetch specification');
        return res.json();
    },

    async updateTask(specId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
        const res = await fetch(`${API_URL}/api/specs/${specId}/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        if (!res.ok) throw new Error('Failed to update task');
        return res.json();
    },

    async moveTask(specId: string, taskId: string, direction: 'up' | 'down'): Promise<void> {
        const res = await fetch(`${API_URL}/api/specs/${specId}/tasks/${taskId}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ direction }),
        });

        if (!res.ok) throw new Error('Failed to move task');
    },

    async exportMarkdown(specId: string): Promise<string> {
        const res = await fetch(`${API_URL}/api/specs/${specId}/export`);
        if (!res.ok) throw new Error('Failed to export specification');
        return res.text();
    },
};
