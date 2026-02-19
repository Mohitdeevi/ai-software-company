'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { post } from '@/lib/api';
import type { ApiResponse, Project } from '@/types';

const featureOptions = [
  { id: 'auth', label: 'Authentication', description: 'User login, registration, and session management' },
  { id: 'crud', label: 'CRUD Operations', description: 'Create, read, update, and delete functionality' },
  { id: 'file-upload', label: 'File Upload', description: 'File upload, storage, and management' },
  { id: 'realtime', label: 'Real-time', description: 'WebSocket-based real-time updates and notifications' },
];

const MAX_PROMPT_LENGTH = 5000;

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((f) => f !== featureId) : [...prev, featureId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please enter a prompt describing your application');
      return;
    }

    setLoading(true);
    try {
      const response = await post<ApiResponse<Project>>('/projects', {
        name: name.trim(),
        prompt: prompt.trim(),
        features,
      });
      toast.success('Project created! Agents are starting...');
      router.push(`/projects/${response.data?._id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create project';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New Project</CardTitle>
              <CardDescription>
                Describe your application and let our AI agents build it.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Project name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">
                Project Name
              </label>
              <Input
                id="name"
                placeholder="My Awesome App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium text-gray-300">
                Application Prompt
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  placeholder="Describe the application you want to build. Be as detailed as possible about features, user roles, data models, and any specific requirements..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
                  rows={8}
                  disabled={loading}
                  className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 transition-all duration-200 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                <div className="mt-1 flex justify-end">
                  <span
                    className={`text-xs ${
                      prompt.length > MAX_PROMPT_LENGTH * 0.9
                        ? 'text-amber-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {prompt.length} / {MAX_PROMPT_LENGTH}
                  </span>
                </div>
              </div>
            </div>

            {/* Optional features */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Optional Features
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {featureOptions.map((feature) => {
                  const isSelected = features.includes(feature.id);
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggleFeature(feature.id)}
                      disabled={loading}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-500/40 bg-indigo-500/10'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/5'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isSelected ? 'text-indigo-400' : 'text-gray-200'
                          }`}
                        >
                          {feature.label}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">{feature.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
