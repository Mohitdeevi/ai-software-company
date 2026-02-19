'use client';

import { useEffect, useRef } from 'react';
import type { BuildLogEntry } from '@/types';

const levelConfig: Record<
  string,
  { label: string; textColor: string }
> = {
  info: { label: 'INFO', textColor: 'text-blue-400' },
  warn: { label: 'WARN', textColor: 'text-amber-400' },
  error: { label: 'ERROR', textColor: 'text-red-400' },
  debug: { label: 'DEBUG', textColor: 'text-gray-500' },
};

interface BuildLogProps {
  logs: BuildLogEntry[];
}

export function BuildLog({ logs }: BuildLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  useEffect(() => {
    if (containerRef.current && shouldAutoScroll.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[600px] overflow-y-auto rounded-xl border border-white/10 bg-gray-900/80"
    >
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-white/5 bg-gray-900/95 px-4 py-2 backdrop-blur-sm">
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="text-xs font-medium text-gray-400">Build Logs</span>
        <span className="text-xs text-gray-600">({logs.length} entries)</span>
      </div>

      <div className="space-y-px p-2">
        {logs.map((log, index) => {
          const config = levelConfig[log.level] || levelConfig.info;
          const timestamp = new Date(log.timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={index}
              className={`group flex items-start gap-3 rounded-lg px-3 py-1.5 font-mono text-xs transition-colors hover:bg-white/5 ${
                log.level === 'error' ? 'bg-red-500/5' : ''
              }`}
            >
              <span className="shrink-0 text-gray-600">{timestamp}</span>
              <span className={`w-12 shrink-0 text-center font-bold ${config.textColor}`}>
                {config.label}
              </span>
              <span
                className={`flex-1 break-all ${
                  log.level === 'error'
                    ? 'text-red-300'
                    : log.level === 'warn'
                    ? 'text-amber-300'
                    : 'text-gray-300'
                }`}
              >
                {log.message}
              </span>
            </div>
          );
        })}
      </div>

      {logs.length === 0 && (
        <div className="flex h-full items-center justify-center text-gray-600">
          <p className="text-sm">Waiting for log entries...</p>
        </div>
      )}
    </div>
  );
}
