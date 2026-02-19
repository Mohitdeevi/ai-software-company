'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  RotateCcw,
  LayoutDashboard,
  FolderTree,
  ScrollText,
} from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AgentProgress } from '@/components/projects/AgentProgress';
import { FileBrowser } from '@/components/projects/FileBrowser';
import { BuildLog } from '@/components/projects/BuildLog';
import { useProject } from '@/hooks/useProject';
import { useSSE } from '@/hooks/useSSE';
import { post, get } from '@/lib/api';
import type { AgentExecution, ApiResponse } from '@/types';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline'> = {
  pending: 'outline',
  processing: 'warning',
  completed: 'success',
  failed: 'danger',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { project, isLoading, mutate } = useProject(projectId);
  const [retrying, setRetrying] = useState(false);

  // SSE for real-time updates
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const sseUrl = projectId ? `${API_BASE_URL}/api/v1/projects/${projectId}/events` : null;

  const { data: sseData } = useSSE(sseUrl, {
    onOpen: () => {},
    onError: () => {},
  });

  if (sseData) {
    mutate();
  }

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await post(`/projects/${projectId}/retry`);
      toast.success('Retrying project generation...');
      mutate();
    } catch {
      toast.error('Failed to retry');
    } finally {
      setRetrying(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await get(`/projects/${projectId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project?.name || 'project'}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download project');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="h-64 animate-pulse rounded-xl bg-white/5" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const agentExecutions: AgentExecution[] = project.outputs?.agentExecutions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <Badge variant={statusVariant[project.status] || 'default'}>
                {statusLabels[project.status] || project.status}
              </Badge>
            </div>
            {project.currentPhase && (
              <p className="mt-1 text-sm text-gray-500">
                Current phase: <span className="font-medium text-gray-300">{project.currentPhase}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.status === 'failed' && (
            <Button variant="outline" onClick={handleRetry} loading={retrying} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          )}
          {project.status === 'completed' && (
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview">
        <Tabs.List className="flex border-b border-white/10">
          <Tabs.Trigger
            value="overview"
            className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-300 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="files"
            className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-300 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400"
          >
            <FolderTree className="h-4 w-4" />
            Files
          </Tabs.Trigger>
          <Tabs.Trigger
            value="logs"
            className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-300 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400"
          >
            <ScrollText className="h-4 w-4" />
            Logs
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Agent progress */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Agent Progress</h2>
                <AgentProgress
                  currentAgent={project.currentAgent || undefined}
                  currentPhase={project.currentPhase || undefined}
                  agentExecutions={agentExecutions}
                />
              </Card>
            </div>

            {/* Project info */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Project Details
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-gray-500">Status</dt>
                    <dd className="mt-0.5 text-sm font-medium text-white">
                      {statusLabels[project.status] || project.status}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Created</dt>
                    <dd className="mt-0.5 text-sm font-medium text-white">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  {project.retryCount > 0 && (
                    <div>
                      <dt className="text-xs text-gray-500">Retry Count</dt>
                      <dd className="mt-0.5 text-sm font-medium text-white">
                        {project.retryCount}
                      </dd>
                    </div>
                  )}
                  {project.tokenUsage.total > 0 && (
                    <div>
                      <dt className="text-xs text-gray-500">Tokens Used</dt>
                      <dd className="mt-0.5 text-sm font-medium text-white">
                        {project.tokenUsage.total.toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>

              <Card className="p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Prompt
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">{project.prompt}</p>
              </Card>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="files" className="mt-6">
          {project.generatedFiles && project.generatedFiles.length > 0 ? (
            <FileBrowser files={project.generatedFiles} />
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <FolderTree className="h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">
                No files generated yet. Files will appear here as agents produce them.
              </p>
            </Card>
          )}
        </Tabs.Content>

        <Tabs.Content value="logs" className="mt-6">
          {project.buildLog && project.buildLog.length > 0 ? (
            <BuildLog logs={project.buildLog} />
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <ScrollText className="h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">
                No logs yet. Build logs will stream in real-time as the project is generated.
              </p>
            </Card>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
