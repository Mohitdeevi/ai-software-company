'use client';

import { useRouter } from 'next/navigation';
import { FolderOpen, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';

const statusConfig: Record<
  string,
  { variant: 'default' | 'success' | 'warning' | 'danger' | 'outline'; accentColor: string; label: string }
> = {
  pending: { variant: 'outline', accentColor: 'border-l-gray-600', label: 'Pending' },
  processing: { variant: 'warning', accentColor: 'border-l-amber-500', label: 'Processing' },
  completed: { variant: 'success', accentColor: 'border-l-emerald-500', label: 'Completed' },
  failed: { variant: 'danger', accentColor: 'border-l-red-500', label: 'Failed' },
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const config = statusConfig[project.status] || statusConfig.pending;

  return (
    <button
      onClick={() => router.push(`/projects/${project._id}`)}
      className={`group w-full rounded-xl border border-white/10 border-l-4 bg-white/[0.03] p-6 text-left transition-all duration-200 hover:bg-white/[0.06] hover:border-white/15 ${config.accentColor}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-500 transition-colors group-hover:bg-indigo-500/10 group-hover:text-indigo-400">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
            {project.currentPhase && (
              <p className="mt-0.5 text-xs text-gray-500">
                {project.currentPhase}
              </p>
            )}
          </div>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
        <ArrowRight className="h-4 w-4 text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400" />
      </div>
    </button>
  );
}
