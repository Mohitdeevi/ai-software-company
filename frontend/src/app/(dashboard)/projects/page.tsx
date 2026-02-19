'use client';

import Link from 'next/link';
import { Plus, FolderOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { useProjects } from '@/hooks/useProject';

function ProjectSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-5 w-1/3 rounded bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/5" />
        </div>
        <div className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="h-3 w-20 rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects();

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage and monitor your AI-generated applications.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && projects && projects.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <FolderOpen className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">No projects yet</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Get started by creating your first project. Describe your app in plain English and
            let our AI agents build it for you.
          </p>
          <Link href="/projects/new" className="mt-6">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Create Your First Project
            </Button>
          </Link>
        </div>
      )}

      {/* Project grid */}
      {!isLoading && projects && projects.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
