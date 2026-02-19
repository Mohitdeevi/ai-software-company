'use client';

import useSWR from 'swr';
import { get } from '@/lib/api';
import type { Project, ApiResponse } from '@/types';

const fetcher = <T>(url: string) => get<ApiResponse<T>>(url).then((res) => res.data);

export function useProjects() {
  const { data: projects, error, isLoading, mutate } = useSWR<Project[] | undefined>(
    '/projects',
    (url: string) => fetcher<Project[]>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    projects,
    isLoading,
    error,
    mutate,
  };
}

export function useProject(id: string | undefined) {
  const { data: project, error, isLoading, mutate } = useSWR<Project | undefined>(
    id ? `/projects/${id}` : null,
    (url: string) => fetcher<Project>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    project,
    isLoading,
    error,
    mutate,
  };
}
