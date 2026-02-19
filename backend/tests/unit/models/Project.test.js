import mongoose from 'mongoose';
import Project from '../../../src/models/Project.js';
import { validProject } from '../../fixtures/projects.js';

describe('Project Model', () => {
  const userId = new mongoose.Types.ObjectId();

  describe('creation', () => {
    it('creates a project with valid data', async () => {
      const project = await Project.create({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
      });

      expect(project._id).toBeDefined();
      expect(project.userId.toString()).toBe(userId.toString());
      expect(project.name).toBe(validProject.name);
      expect(project.prompt).toBe(validProject.prompt);
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });
  });

  describe('required fields', () => {
    it('requires userId', async () => {
      const project = new Project({
        name: validProject.name,
        prompt: validProject.prompt,
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });

    it('requires name', async () => {
      const project = new Project({
        userId,
        prompt: validProject.prompt,
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    it('requires prompt', async () => {
      const project = new Project({
        userId,
        name: validProject.name,
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.prompt).toBeDefined();
    });
  });

  describe('validation', () => {
    it('enforces minimum prompt length of 10 characters', async () => {
      const project = new Project({
        userId,
        name: validProject.name,
        prompt: 'Short',
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.prompt).toBeDefined();
    });

    it('enforces maximum prompt length of 10000 characters', async () => {
      const project = new Project({
        userId,
        name: validProject.name,
        prompt: 'X'.repeat(10001),
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.prompt).toBeDefined();
    });

    it('enforces maximum name length of 200 characters', async () => {
      const project = new Project({
        userId,
        name: 'A'.repeat(201),
        prompt: validProject.prompt,
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    it('rejects invalid status values', async () => {
      const project = new Project({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
        status: 'unknown',
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });
  });

  describe('defaults', () => {
    it('defaults status to pending', async () => {
      const project = await Project.create({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
      });

      expect(project.status).toBe('pending');
    });

    it('defaults retryCount to 0', async () => {
      const project = await Project.create({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
      });

      expect(project.retryCount).toBe(0);
    });

    it('defaults config.stack to node-mongo-next', async () => {
      const project = await Project.create({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
      });

      expect(project.config.stack).toBe('node-mongo-next');
    });

    it('defaults tokenUsage values to 0', async () => {
      const project = await Project.create({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
      });

      expect(project.tokenUsage.prompt).toBe(0);
      expect(project.tokenUsage.completion).toBe(0);
      expect(project.tokenUsage.total).toBe(0);
      expect(project.tokenUsage.estimatedCost).toBe(0);
    });
  });

  describe('generatedFiles', () => {
    it('stores generatedFiles array', async () => {
      const project = await Project.create({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
        generatedFiles: [
          { path: 'src/index.js', content: 'console.log("hello");', language: 'javascript' },
          { path: 'package.json', content: '{}', language: 'json' },
        ],
      });

      expect(project.generatedFiles).toHaveLength(2);
      expect(project.generatedFiles[0].path).toBe('src/index.js');
      expect(project.generatedFiles[0].content).toBe('console.log("hello");');
      expect(project.generatedFiles[0].language).toBe('javascript');
    });

    it('requires path and content in generatedFiles entries', async () => {
      const project = new Project({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
        generatedFiles: [{ language: 'javascript' }],
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
    });
  });

  describe('buildLog', () => {
    it('stores buildLog entries', async () => {
      const project = await Project.create({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
        buildLog: [
          { level: 'info', message: 'Starting build...' },
          { level: 'error', message: 'Build failed' },
        ],
      });

      expect(project.buildLog).toHaveLength(2);
      expect(project.buildLog[0].level).toBe('info');
      expect(project.buildLog[0].message).toBe('Starting build...');
      expect(project.buildLog[0].timestamp).toBeDefined();
      expect(project.buildLog[1].level).toBe('error');
    });

    it('validates buildLog level enum', async () => {
      const project = new Project({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
        buildLog: [{ level: 'critical', message: 'Should fail' }],
      });

      const error = project.validateSync();
      expect(error).toBeDefined();
    });
  });

  describe('outputs', () => {
    it('stores mixed-type output fields', async () => {
      const project = await Project.create({
        userId,
        name: validProject.name,
        prompt: validProject.prompt,
      });

      project.outputs = {
        strategic_plan: { goals: ['MVP launch'] },
        prd: { features: ['auth', 'dashboard'] },
      };
      await project.save();

      const fetched = await Project.findById(project._id);
      expect(fetched.outputs.strategic_plan).toEqual({ goals: ['MVP launch'] });
      expect(fetched.outputs.prd).toEqual({ features: ['auth', 'dashboard'] });
    });
  });
});
