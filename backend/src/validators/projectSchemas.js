import { z } from 'zod';

/**
 * Zod schema for creating a new project.
 *
 * Validates:
 *  - name   – 1-200 characters
 *  - prompt – 10-10 000 characters (the user's natural-language brief)
 *  - config – optional object with an optional features string array
 */
export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required.' })
    .min(1, 'Project name is required.')
    .max(200, 'Project name must be at most 200 characters.'),
  prompt: z
    .string({ required_error: 'Prompt is required.' })
    .min(10, 'Prompt must be at least 10 characters.')
    .max(10000, 'Prompt must be at most 10 000 characters.'),
  config: z
    .object({
      features: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Zod schema for validating a MongoDB ObjectId supplied as a route param.
 *
 * Usage: validate(projectIdSchema, 'params')
 */
export const projectIdSchema = z.object({
  id: z
    .string({ required_error: 'Project id is required.' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid project id format.'),
});
