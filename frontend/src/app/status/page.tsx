'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Runtime API URL detection
const getApiUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'mini-planning-tool.up.railway.app') {
        return 'https://ai-task-generator-production.up.railway.app';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();

interface HealthStatus {
    backend: boolean;
    database: boolean;
    llm: boolean;
    timestamp: string;
}

export default function StatusPage() {
    const [status, setStatus] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/status`);
            const data = await res.json();
            setStatus(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load status');
        } finally {
            setLoading(false);
        }
    };

    const StatusIndicator = ({ healthy }: { healthy: boolean }) => (
        <span
            className={`inline-block w-3 h-3 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'
                }`}
        />
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
                    ← Back to Home
                </Link>

                <h1 className="text-4xl font-bold text-gray-900 mb-8">System Status</h1>

                {loading ? (
                    <p className="text-gray-500">Loading status...</p>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                ) : status ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Backend</h2>
                                    <p className="text-sm text-gray-500">API Server</p>
                                </div>
                                <StatusIndicator healthy={status.backend} />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Database</h2>
                                    <p className="text-sm text-gray-500">PostgreSQL Connection</p>
                                </div>
                                <StatusIndicator healthy={status.database} />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">LLM Service</h2>
                                    <p className="text-sm text-gray-500">OpenAI API</p>
                                </div>
                                <StatusIndicator healthy={status.llm} />
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Last checked: {new Date(status.timestamp).toLocaleString()}
                            </p>
                            <button
                                onClick={loadStatus}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Refresh Status
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
