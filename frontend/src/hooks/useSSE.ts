'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getToken } from '@/lib/auth';

interface UseSSEOptions {
  /** Whether the SSE connection should be active. Defaults to true. */
  enabled?: boolean;
  /** Reconnect delay in milliseconds. Defaults to 3000. */
  reconnectDelay?: number;
  /** Maximum number of reconnect attempts. Defaults to 10. */
  maxRetries?: number;
  /** Event name to listen for. Defaults to 'message'. */
  eventName?: string;
  /** Called when the connection opens. */
  onOpen?: () => void;
  /** Called when an error occurs. */
  onError?: (error: Event) => void;
}

interface UseSSEReturn<T = any> {
  /** The most recent data received from the SSE stream. */
  data: T | null;
  /** Any error that occurred during connection. */
  error: Event | null;
  /** Whether the SSE connection is currently active. */
  connected: boolean;
}

export function useSSE<T = any>(
  url: string | null,
  options: UseSSEOptions = {}
): UseSSEReturn<T> {
  const {
    enabled = true,
    reconnectDelay = 3000,
    maxRetries = 10,
    eventName = 'message',
    onOpen,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const [connected, setConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!url || !enabled) return;

    cleanup();

    // Build URL with auth token as query param (SSE does not support custom headers)
    const token = getToken();
    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = token ? `${url}${separator}token=${encodeURIComponent(token)}` : url;

    const eventSource = new EventSource(fullUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
      retriesRef.current = 0;
      onOpen?.();
    };

    eventSource.addEventListener(eventName, (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setData(parsed);
      } catch {
        // If the data is not JSON, store it as-is
        setData(event.data as unknown as T);
      }
    });

    eventSource.onerror = (err) => {
      setError(err);
      setConnected(false);
      onError?.(err);

      eventSource.close();
      eventSourceRef.current = null;

      // Auto-reconnect if within retry limit
      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay);
      }
    };
  }, [url, enabled, eventName, reconnectDelay, maxRetries, onOpen, onError, cleanup]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  return { data, error, connected };
}
