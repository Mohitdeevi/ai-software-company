import Project from '../models/Project.js';
import AgentExecution from '../models/AgentExecution.js';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

// Agent imports
import { execute as executeManager } from './agents/managerAgent.js';
import { execute as executeSales } from './agents/salesAgent.js';
import { execute as executeProductManager } from './agents/productManagerAgent.js';
import { execute as executeScrumMaster } from './agents/scrumMasterAgent.js';
import { execute as executeArchitect } from './agents/architectAgent.js';
import { execute as executeBackendDev } from './agents/backendDevAgent.js';
import { execute as executeFrontendDev } from './agents/frontendDevAgent.js';
import { execute as executeTester } from './agents/testerAgent.js';
import { execute as executeDevops } from './agents/devopsAgent.js';
import { execute as executeSecurity } from './agents/securityAgent.js';
import { execute as executeObservability } from './agents/observabilityAgent.js';

/* ------------------------------------------------------------------ */
/*  Agent registry                                                     */
/* ------------------------------------------------------------------ */
const AGENT_MAP = {
  manager: executeManager,
  sales: executeSales,
  product_manager: executeProductManager,
  scrum_master: executeScrumMaster,
  architect: executeArchitect,
  backend_developer: executeBackendDev,
  frontend_developer: executeFrontendDev,
  tester: executeTester,
  devops: executeDevops,
  security: executeSecurity,
  observability: executeObservability,
};

/* ------------------------------------------------------------------ */
/*  Phase pipeline definition                                          */
/* ------------------------------------------------------------------ */
const PHASES = [
  { name: 'strategic_definition', agents: ['manager', 'sales'], outputKey: 'strategic_plan' },
  { name: 'product_definition', agents: ['product_manager'], outputKey: 'prd' },
  { name: 'sprint_planning', agents: ['scrum_master'], outputKey: 'sprint_plan' },
  { name: 'architecture', agents: ['architect'], outputKey: 'architecture' },
  { name: 'backend_development', agents: ['backend_developer'], outputKey: 'backend_plan' },
  { name: 'frontend_development', agents: ['frontend_developer'], outputKey: 'frontend_plan' },
  { name: 'testing', agents: ['tester'], outputKey: 'testing_plan' },
  { name: 'devops', agents: ['devops'], outputKey: 'devops_plan' },
  { name: 'security', agents: ['security'], outputKey: 'security_plan' },
  { name: 'observability', agents: ['observability'], outputKey: 'observability_plan' },
];

const MAX_RETRIES = 3;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function publish(channel, payload) {
  try {
    const redis = getRedisClient();
    redis.publish(channel, JSON.stringify(payload));
  } catch (err) {
    logger.warn({ err }, 'Redis publish failed (non-fatal)');
  }
}

function buildAgentInput(agentName, project) {
  const { prompt, outputs } = project;
  const base = { prompt };

  switch (agentName) {
    case 'manager':
      return { ...base };
    case 'sales':
      return { ...base, strategic_context: outputs.strategic_plan };
    case 'product_manager':
      return { ...base, strategic_plan: outputs.strategic_plan };
    case 'scrum_master':
      return { ...base, prd: outputs.prd };
    case 'architect':
      return { ...base, prd: outputs.prd, sprint_plan: outputs.sprint_plan };
    case 'backend_developer':
      return { ...base, architecture: outputs.architecture };
    case 'frontend_developer':
      return {
        ...base,
        architecture: outputs.architecture,
        api_endpoints: outputs.architecture?.api_endpoints,
      };
    case 'tester':
      return {
        ...base,
        architecture: outputs.architecture,
        backend_plan: outputs.backend_plan,
        frontend_plan: outputs.frontend_plan,
      };
    case 'devops':
      return { ...base, architecture: outputs.architecture };
    case 'security':
      return { architecture: outputs.architecture, backend_plan: outputs.backend_plan };
    case 'observability':
      return { architecture: outputs.architecture, devops_plan: outputs.devops_plan };
    default:
      return base;
  }
}

function accumulateTokens(project, usage) {
  project.tokenUsage.prompt += usage.input_tokens || 0;
  project.tokenUsage.completion += usage.output_tokens || 0;
  project.tokenUsage.total =
    project.tokenUsage.prompt + project.tokenUsage.completion;
}

/* ------------------------------------------------------------------ */
/*  Main orchestration                                                 */
/* ------------------------------------------------------------------ */

/**
 * Execute the full agent pipeline for a project.
 *
 * @param {string} projectId - Mongoose ObjectId of the project.
 */
export async function executeOrchestration(projectId) {
  const project = await Project.findById(projectId);
  if (!project) {
    logger.error({ projectId }, 'Project not found for orchestration');
    return;
  }

  project.status = 'processing';
  project.buildLog.push({ level: 'info', message: 'Orchestration started' });
  await project.save();

  publish(`project:${projectId}`, { event: 'started', projectId });

  try {
    for (const phase of PHASES) {
      project.currentPhase = phase.name;
      project.buildLog.push({ level: 'info', message: `Phase started: ${phase.name}` });
      await project.save();

      publish(`project:${projectId}`, {
        event: 'phase_started',
        phase: phase.name,
        projectId,
      });

      let phaseOutput = null;

      for (const agentName of phase.agents) {
        const executeFn = AGENT_MAP[agentName];
        if (!executeFn) {
          logger.error({ agentName }, 'Unknown agent — skipping');
          continue;
        }

        project.currentAgent = agentName;
        await project.save();

        const input = buildAgentInput(agentName, project);
        let attempt = 0;
        let success = false;

        while (attempt < MAX_RETRIES && !success) {
          attempt++;
          const startTime = Date.now();

          const execution = await AgentExecution.create({
            projectId: project._id,
            agentName,
            phase: phase.name,
            input,
            status: 'running',
            retryAttempt: attempt - 1,
          });

          try {
            logger.info({ agentName, attempt }, 'Executing agent');

            const result = await executeFn(input);

            const durationMs = Date.now() - startTime;

            execution.output = result.output;
            execution.tokenUsage = {
              prompt: result.tokenUsage?.input_tokens || 0,
              completion: result.tokenUsage?.output_tokens || 0,
              total:
                (result.tokenUsage?.input_tokens || 0) +
                (result.tokenUsage?.output_tokens || 0),
            };
            execution.duration_ms = durationMs;
            execution.status = 'success';
            await execution.save();

            accumulateTokens(project, result.tokenUsage || {});
            phaseOutput = result.output;
            success = true;

            project.buildLog.push({
              level: 'info',
              message: `Agent ${agentName} completed (${durationMs}ms)`,
            });

            publish(`project:${projectId}`, {
              event: 'agent_completed',
              agent: agentName,
              phase: phase.name,
              durationMs,
              projectId,
            });
          } catch (agentErr) {
            const durationMs = Date.now() - startTime;

            execution.status = attempt < MAX_RETRIES ? 'retrying' : 'failed';
            execution.errorMessage = agentErr.message;
            execution.duration_ms = durationMs;
            await execution.save();

            logger.error(
              { err: agentErr, agentName, attempt },
              'Agent execution failed',
            );

            project.buildLog.push({
              level: 'error',
              message: `Agent ${agentName} failed (attempt ${attempt}): ${agentErr.message}`,
            });

            if (attempt >= MAX_RETRIES) {
              throw agentErr;
            }

            // Brief back-off before retry
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
      }

      // Store the last agent's output under the phase output key
      if (phaseOutput !== null) {
        project.outputs[phase.outputKey] = phaseOutput;
        project.markModified(`outputs.${phase.outputKey}`);
      }

      await project.save();

      publish(`project:${projectId}`, {
        event: 'phase_completed',
        phase: phase.name,
        projectId,
      });
    }

    // All phases done
    project.status = 'completed';
    project.currentPhase = null;
    project.currentAgent = null;
    project.buildLog.push({ level: 'info', message: 'Orchestration completed' });
    await project.save();

    publish(`project:${projectId}`, { event: 'completed', projectId });
    logger.info({ projectId }, 'Orchestration completed successfully');
  } catch (err) {
    project.status = 'failed';
    project.buildLog.push({ level: 'error', message: `Orchestration failed: ${err.message}` });
    await project.save();

    publish(`project:${projectId}`, {
      event: 'failed',
      error: err.message,
      projectId,
    });

    logger.error({ err, projectId }, 'Orchestration failed');
  }
}
