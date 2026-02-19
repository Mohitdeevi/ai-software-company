'use client';

import useSWR from 'swr';
import { api, get, post } from '@/lib/api';
import { setToken, clearToken } from '@/lib/auth';
import type { User, ApiResponse } from '@/types';

const fetcher = (url: string) => get<ApiResponse<User>>(url).then((res) => res.data);

export function useAuth() {
  const { data: user, error, isLoading, mutate } = useSWR<User | undefined>(
    '/auth/me',
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: () => {
        // Silently handle auth errors (user not logged in)
      },
    }
  );

  const login = async (email: string, password: string) => {
    const response = await post<ApiResponse<{ user: User; accessToken: string }>>(
      '/auth/login',
      { email, password }
    );

    if (response.data?.accessToken) {
      setToken(response.data.accessToken);
    }

    await mutate(response.data?.user, false);
    return response.data?.user;
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await post<ApiResponse<{ user: User; accessToken: string }>>(
      '/auth/register',
      { email, password, name }
    );

    if (response.data?.accessToken) {
      setToken(response.data.accessToken);
    }

    await mutate(response.data?.user, false);
    return response.data?.user;
  };

  const logout = async () => {
    try {
      await post('/auth/logout');
    } catch {
      // Proceed with client-side logout even if server call fails
    } finally {
      clearToken();
      await mutate(undefined, false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    mutate,
  };
}
