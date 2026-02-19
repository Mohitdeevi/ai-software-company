export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  tokenUsage: { used: number; limit: number; resetAt: string };
  createdAt: string;
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  currentPhase: string | null;
  currentAgent: string | null;
  retryCount: number;
  config: { stack: string; features: string[] };
  outputs: Record<string, any>;
  generatedFiles: GeneratedFile[];
  buildLog: BuildLogEntry[];
  tokenUsage: { prompt: number; completion: number; total: number; estimatedCost: number };
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface BuildLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface AgentExecution {
  _id: string;
  projectId: string;
  agentName: string;
  phase: string;
  status: 'running' | 'success' | 'failed' | 'retrying';
  duration_ms: number;
  tokenUsage: { prompt: number; completion: number; total: number };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: any };
}
