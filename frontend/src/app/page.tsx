'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, CreateSpecInput, Spec } from '@/lib/api';

export default function HomePage() {
    const [formData, setFormData] = useState<CreateSpecInput>({
        goal: '',
        users: '',
        constraints: '',
        templateType: 'Web App',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentSpecs, setRecentSpecs] = useState<Spec[]>([]);
    const [loadingSpecs, setLoadingSpecs] = useState(true);

    // Load recent specs on mount
    useState(() => {
        api
            .getSpecs()
            .then(setRecentSpecs)
            .catch((err) => console.error('Failed to load specs:', err))
            .finally(() => setLoadingSpecs(false));
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const spec = await api.createSpec(formData);
            // Redirect to spec detail page
            window.location.href = `/specs/${spec.id}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    AI Tasks Generator
                </h1>
                <p className="text-gray-600 mb-8">Mini Planning Tool</p>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
                                Goal <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="goal"
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.goal}
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                placeholder="What do you want to build?"
                            />
                        </div>

                        <div>
                            <label htmlFor="users" className="block text-sm font-medium text-gray-700 mb-1">
                                Target Users <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="users"
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.users}
                                onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                                placeholder="Who will use this?"
                            />
                        </div>

                        <div>
                            <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-1">
                                Constraints
                            </label>
                            <textarea
                                id="constraints"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.constraints}
                                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                                placeholder="Any limitations or requirements?"
                            />
                        </div>

                        <div>
                            <label htmlFor="templateType" className="block text-sm font-medium text-gray-700 mb-1">
                                Template Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="templateType"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.templateType}
                                onChange={(e) => setFormData({ ...formData, templateType: e.target.value })}
                            >
                                <option value="Web App">Web App</option>
                                <option value="Mobile App">Mobile App</option>
                                <option value="Internal Tool">Internal Tool</option>
                            </select>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Generating...' : 'Generate Plan'}
                        </button>
                    </form>
                </div>

                {/* Recent Specs */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Specifications</h2>

                    {loadingSpecs ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : recentSpecs.length === 0 ? (
                        <p className="text-gray-500">No specifications yet. Create your first one above!</p>
                    ) : (
                        <div className="space-y-3">
                            {recentSpecs.map((spec) => (
                                <Link
                                    key={spec.id}
                                    href={`/specs/${spec.id}`}
                                    className="block p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{spec.goal}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{spec.templateType}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(spec.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
