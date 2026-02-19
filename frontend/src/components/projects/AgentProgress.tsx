'use client';

import {
  Brain,
  Code,
  Database,
  Server,
  Shield,
  TestTube,
  Container,
  GitBranch,
  Monitor,
  FileText,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AgentExecution } from '@/types';

const AGENTS = [
  { name: 'project-manager', label: 'Project Manager', icon: Brain, description: 'Orchestrates the build pipeline' },
  { name: 'architect', label: 'Architect', icon: FileText, description: 'Designs system architecture' },
  { name: 'frontend', label: 'Frontend Developer', icon: Monitor, description: 'Builds the user interface' },
  { name: 'backend', label: 'Backend Developer', icon: Server, description: 'Creates API and business logic' },
  { name: 'database', label: 'Database Engineer', icon: Database, description: 'Designs data models and queries' },
  { name: 'auth', label: 'Auth Specialist', icon: Shield, description: 'Implements authentication and security' },
  { name: 'testing', label: 'QA Engineer', icon: TestTube, description: 'Writes tests and validates code' },
  { name: 'devops', label: 'DevOps Engineer', icon: Container, description: 'Sets up CI/CD and Docker' },
  { name: 'code-review', label: 'Code Reviewer', icon: GitBranch, description: 'Reviews code quality and patterns' },
  { name: 'documentation', label: 'Documentation Writer', icon: FileText, description: 'Generates documentation' },
  { name: 'deployer', label: 'Deployer', icon: Rocket, description: 'Handles deployment configuration' },
];

type DisplayStatus = 'pending' | 'running' | 'success' | 'failed' | 'retrying';

interface AgentProgressProps {
  currentAgent?: string;
  currentPhase?: string;
  agentExecutions: AgentExecution[];
}

function getAgentStatus(
  agentName: string,
  currentAgent: string | undefined,
  executions: AgentExecution[]
): DisplayStatus {
  const execution = executions.find((e) => e.agentName === agentName);
  if (execution) return execution.status;
  if (currentAgent === agentName) return 'running';
  return 'pending';
}

const statusIcon: Record<DisplayStatus | 'pending', React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-gray-600" />,
  running: <Loader2 className="h-4 w-4 animate-spin text-amber-400" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />,
  retrying: <Loader2 className="h-4 w-4 animate-spin text-amber-400" />,
};

const statusBadge: Record<DisplayStatus | 'pending', { variant: 'default' | 'success' | 'warning' | 'danger' | 'outline'; label: string }> = {
  pending: { variant: 'outline', label: 'Pending' },
  running: { variant: 'warning', label: 'Running' },
  success: { variant: 'success', label: 'Completed' },
  failed: { variant: 'danger', label: 'Failed' },
  retrying: { variant: 'warning', label: 'Retrying' },
};

export function AgentProgress({ currentAgent, currentPhase, agentExecutions }: AgentProgressProps) {
  return (
    <div className="relative space-y-0">
      {AGENTS.map((agent, index) => {
        const status = getAgentStatus(agent.name, currentAgent, agentExecutions);
        const execution = agentExecutions.find((e) => e.agentName === agent.name);
        const isLast = index === AGENTS.length - 1;
        const badge = statusBadge[status];
        const isRunning = status === 'running' || status === 'retrying';
        const isCompleted = status === 'success';

        return (
          <div
            key={agent.name}
            className={`relative flex gap-4 pb-6 ${isRunning ? 'animate-agent-pulse' : ''}`}
          >
            {/* Timeline line */}
            {!isLast && (
              <div
                className={`absolute left-5 top-10 h-full w-0.5 ${
                  isCompleted
                    ? 'bg-emerald-500/30'
                    : isRunning
                    ? 'bg-amber-500/30'
                    : 'bg-white/5'
                }`}
              />
            )}

            {/* Timeline dot */}
            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                isCompleted
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : isRunning
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : status === 'failed'
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <agent.icon
                className={`h-5 w-5 ${
                  isCompleted
                    ? 'text-emerald-400'
                    : isRunning
                    ? 'text-amber-400'
                    : status === 'failed'
                    ? 'text-red-400'
                    : 'text-gray-500'
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-medium ${
                    isCompleted
                      ? 'text-emerald-400'
                      : isRunning
                      ? 'text-amber-400'
                      : status === 'failed'
                      ? 'text-red-400'
                      : 'text-gray-500'
                  }`}
                >
                  {agent.label}
                </h4>
                {statusIcon[status]}
                <Badge variant={badge.variant} className="text-[10px]">
                  {badge.label}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{agent.description}</p>
              {execution && execution.duration_ms > 0 && (
                <p className="mt-1 text-xs text-gray-600">
                  Duration: {(execution.duration_ms / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
