import { z } from 'zod';

/**
 * Zod schema for user registration.
 *
 * Validates:
 *  - email  – valid email address
 *  - password – 8-100 characters
 *  - name   – 1-100 characters
 */
export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Must be a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(100, 'Password must be at most 100 characters.'),
  name: z
    .string({ required_error: 'Name is required.' })
    .min(1, 'Name is required.')
    .max(100, 'Name must be at most 100 characters.'),
});

/**
 * Zod schema for user login.
 *
 * Validates:
 *  - email    – valid email address
 *  - password – non-empty string
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Must be a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

/**
 * Zod schema for token refresh.
 *
 * No body is needed – the refresh token is read from an httpOnly cookie.
 * This schema exists as a placeholder so routes can reference it
 * uniformly via the validate middleware.
 */
export const refreshSchema = z.object({});
