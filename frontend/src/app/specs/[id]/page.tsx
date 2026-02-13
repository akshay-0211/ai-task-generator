'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Spec, Task } from '@/lib/api';

export default function SpecDetailPage() {
    const params = useParams();
    const router = useRouter();
    const specId = params.id as string;

    const [spec, setSpec] = useState<Spec | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '' });
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadSpec();
    }, [specId]);

    const loadSpec = async () => {
        try {
            const data = await api.getSpec(specId);
            setSpec(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load specification');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (task: Task) => {
        setEditingTask(task.id);
        setEditForm({ title: task.title, description: task.description });
    };

    const saveEdit = async (taskId: string) => {
        try {
            await api.updateTask(specId, taskId, editForm);
            setEditingTask(null);
            await loadSpec();
        } catch (err) {
            alert('Failed to update task');
        }
    };

    const cancelEdit = () => {
        setEditingTask(null);
        setEditForm({ title: '', description: '' });
    };

    const moveTask = async (taskId: string, direction: 'up' | 'down') => {
        try {
            await api.moveTask(specId, taskId, direction);
            await loadSpec();
        } catch (err) {
            alert('Failed to move task');
        }
    };

    const copyMarkdown = async () => {
        try {
            setExporting(true);
            const markdown = await api.exportMarkdown(specId);
            await navigator.clipboard.writeText(markdown);
            alert('Copied to clipboard!');
        } catch (err) {
            alert('Failed to copy markdown');
        } finally {
            setExporting(false);
        }
    };

    const downloadMarkdown = async () => {
        try {
            setExporting(true);
            const markdown = await api.exportMarkdown(specId);
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spec-${specId}.md`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to download markdown');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !spec) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error || 'Specification not found'}
                    </div>
                    <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
                        ← Back to Home
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{spec.templateType} Specification</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Created: {new Date(spec.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyMarkdown}
                                disabled={exporting}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            >
                                Copy as Markdown
                            </button>
                            <button
                                onClick={downloadMarkdown}
                                disabled={exporting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Download .md
                            </button>
                        </div>
                    </div>
                </div>

                {/* Spec Details */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Goal</h2>
                            <p className="text-gray-900 mt-1">{spec.goal}</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Target Users</h2>
                            <p className="text-gray-900 mt-1">{spec.users}</p>
                        </div>
                        {spec.constraints && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Constraints</h2>
                                <p className="text-gray-900 mt-1">{spec.constraints}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Stories */}
                {spec.userStories && spec.userStories.length > 0 && (
                    <div className="space-y-6">
                        {spec.userStories.map((story) => (
                            <div key={story.id} className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{story.title}</h2>
                                <p className="text-gray-700 mb-4">{story.description}</p>

                                {/* Tasks grouped by groupName */}
                                {story.tasks.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Tasks</h3>
                                        {Object.entries(
                                            story.tasks.reduce((acc, task) => {
                                                if (!acc[task.groupName]) acc[task.groupName] = [];
                                                acc[task.groupName].push(task);
                                                return acc;
                                            }, {} as Record<string, Task[]>)
                                        ).map(([groupName, tasks]) => (
                                            <div key={groupName} className="border-l-4 border-blue-500 pl-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">{groupName}</h4>
                                                <div className="space-y-2">
                                                    {tasks.map((task, index) => (
                                                        <div
                                                            key={task.id}
                                                            className="bg-gray-50 p-3 rounded border border-gray-200"
                                                        >
                                                            {editingTask === task.id ? (
                                                                <div className="space-y-2">
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.title}
                                                                        onChange={(e) =>
                                                                            setEditForm({ ...editForm, title: e.target.value })
                                                                        }
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                                                    />
                                                                    <textarea
                                                                        value={editForm.description}
                                                                        onChange={(e) =>
                                                                            setEditForm({ ...editForm, description: e.target.value })
                                                                        }
                                                                        rows={2}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => saveEdit(task.id)}
                                                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            onClick={cancelEdit}
                                                                            className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex-1">
                                                                            <h5 className="font-medium text-gray-900">{task.title}</h5>
                                                                            <p className="text-sm text-gray-600 mt-1">
                                                                                {task.description}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex gap-1 ml-4">
                                                                            <button
                                                                                onClick={() => moveTask(task.id, 'up')}
                                                                                disabled={index === 0}
                                                                                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                title="Move up"
                                                                            >
                                                                                ↑
                                                                            </button>
                                                                            <button
                                                                                onClick={() => moveTask(task.id, 'down')}
                                                                                disabled={index === tasks.length - 1}
                                                                                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                title="Move down"
                                                                            >
                                                                                ↓
                                                                            </button>
                                                                            <button
                                                                                onClick={() => startEdit(task)}
                                                                                className="px-2 py-1 text-xs bg-blue-200 rounded hover:bg-blue-300"
                                                                                title="Edit"
                                                                            >
                                                                                ✎
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Risks */}
                {spec.risks && spec.risks.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Risks</h2>
                        <ul className="list-disc list-inside space-y-2">
                            {spec.risks.map((risk) => (
                                <li key={risk.id} className="text-gray-700">
                                    {risk.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
