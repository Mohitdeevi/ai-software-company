import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/* ------------------------------------------------------------------ */
/*  Helper – JWT token pair                                            */
/* ------------------------------------------------------------------ */

/**
 * Generate an access token (short-lived) and a refresh token (long-lived)
 * for the given user document.
 *
 * @param {import('mongoose').Document} user - Mongoose User document.
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function generateTokens(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiry, // default 15m
  });

  const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry, // default 7d
  });

  return { accessToken, refreshToken };
}

/* ------------------------------------------------------------------ */
/*  Cookie helper                                                      */
/* ------------------------------------------------------------------ */

/**
 * Attach the refresh token as an httpOnly, Secure, SameSite cookie.
 *
 * @param {import('express').Response} res
 * @param {string} refreshToken
 */
function setRefreshCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/**
 * Clear the refresh token cookie.
 *
 * @param {import('express').Response} res
 */
function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: '/',
  });
}

/* ================================================================== */
/*  Route handlers                                                     */
/* ================================================================== */

/**
 * POST /api/auth/register
 *
 * Create a new user account and return token pair.
 * The password is hashed automatically by the User model pre-save hook.
 */
export async function register(req, res) {
  const { email, password, name } = req.body;

  // Check for existing user
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ConflictError('A user with this email already exists.');
  }

  const user = await User.create({
    email,
    name,
    passwordHash: password, // pre-save hook hashes this
  });

  const { accessToken, refreshToken } = generateTokens(user);

  // Persist refresh token on the user document
  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  setRefreshCookie(res, refreshToken);

  logger.info({ userId: user._id }, 'User registered');

  res.status(201).json({
    status: 'success',
    data: {
      user: user.toJSON(),
      accessToken,
    },
  });
}

/**
 * POST /api/auth/login
 *
 * Authenticate an existing user and return a token pair.
 */
export async function login(req, res) {
  const { email, password } = req.body;

  // +passwordHash because the field has `select: false` on the schema
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash'
  );

  if (!user) {
    throw new AuthenticationError('Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthenticationError('Invalid email or password.');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Rotate refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  setRefreshCookie(res, refreshToken);

  logger.info({ userId: user._id }, 'User logged in');

  res.status(200).json({
    status: 'success',
    data: {
      user: user.toJSON(),
      accessToken,
    },
  });
}

/**
 * POST /api/auth/refresh
 *
 * Issue a new access + refresh token pair using the httpOnly refresh cookie.
 * The old refresh token is rotated (replaced) on the user document.
 */
export async function refresh(req, res) {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AuthenticationError('Refresh token not found.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwt.refreshSecret);
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token.');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user) {
    throw new AuthenticationError('User not found.');
  }

  // Verify the stored refresh token matches (prevents reuse)
  if (user.refreshToken !== token) {
    // Possible token theft – invalidate all sessions for this user
    user.refreshToken = null;
    await user.save({ validateModifiedOnly: true });
    throw new AuthenticationError('Refresh token has been revoked.');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Rotate
  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: { accessToken },
  });
}

/**
 * POST /api/auth/logout
 *
 * Clear the refresh token from the user document and the cookie.
 */
export async function logout(req, res) {
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

  clearRefreshCookie(res);

  logger.info({ userId: req.user.id }, 'User logged out');

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
}

/**
 * GET /api/auth/me
 *
 * Return the authenticated user's profile.
 * req.user is attached by the authenticate middleware.
 */
export async function getMe(req, res) {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({
    status: 'success',
    data: { user: user.toJSON() },
  });
}
