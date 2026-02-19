import { Router } from 'express';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import { registerSchema, loginSchema } from '../validators/authSchemas.js';
import * as authController from '../controllers/authController.js';

const router = Router();

// POST /register - Create a new user account
router.post('/register', validate(registerSchema), authController.register);

// POST /login - Authenticate and receive tokens
router.post('/login', validate(loginSchema), authController.login);

// POST /refresh - Exchange refresh token for new access token
router.post('/refresh', authController.refresh);

// POST /logout - Invalidate the current session (requires auth)
router.post('/logout', authenticate, authController.logout);

// GET /me - Retrieve the authenticated user's profile
router.get('/me', authenticate, authController.getMe);

export default router;
