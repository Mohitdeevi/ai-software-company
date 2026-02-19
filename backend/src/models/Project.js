import mongoose from 'mongoose';

const buildLogEntrySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'] },
    message: String,
  },
  { _id: false }
);

const generatedFileSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    content: { type: String, required: true },
    language: String,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    prompt: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10000,
    },
    extractedRequirements: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    currentPhase: {
      type: String,
      default: null,
    },
    currentAgent: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    config: {
      stack: { type: String, default: 'node-mongo-next' },
      features: [String],
    },
    outputs: {
      strategic_plan: mongoose.Schema.Types.Mixed,
      prd: mongoose.Schema.Types.Mixed,
      architecture: mongoose.Schema.Types.Mixed,
      backend_plan: mongoose.Schema.Types.Mixed,
      frontend_plan: mongoose.Schema.Types.Mixed,
      testing_plan: mongoose.Schema.Types.Mixed,
      devops_plan: mongoose.Schema.Types.Mixed,
      security_plan: mongoose.Schema.Types.Mixed,
      observability_plan: mongoose.Schema.Types.Mixed,
    },
    generatedFiles: [generatedFileSchema],
    buildLog: [buildLogEntrySchema],
    githubRepo: {
      type: String,
      default: null,
    },
    tokenUsage: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      estimatedCost: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
