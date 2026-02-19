import mongoose from 'mongoose';

const agentExecutionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    agentName: {
      type: String,
      required: true,
      enum: [
        'manager',
        'sales',
        'product_manager',
        'scrum_master',
        'architect',
        'backend_developer',
        'frontend_developer',
        'tester',
        'devops',
        'security',
        'observability',
      ],
      index: true,
    },
    phase: {
      type: String,
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    tokenUsage: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    duration_ms: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['running', 'success', 'failed', 'retrying'],
      default: 'running',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    retryAttempt: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

agentExecutionSchema.index({ projectId: 1, createdAt: 1 });

const AgentExecution = mongoose.model('AgentExecution', agentExecutionSchema);
export default AgentExecution;
