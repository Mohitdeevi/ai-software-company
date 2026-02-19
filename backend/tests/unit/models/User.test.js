import mongoose from 'mongoose';
import User from '../../../src/models/User.js';
import { validUser, adminUser } from '../../fixtures/users.js';

describe('User Model', () => {
  describe('creation', () => {
    it('creates a user with valid data', async () => {
      const user = await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      expect(user._id).toBeDefined();
      expect(user.email).toBe(validUser.email);
      expect(user.name).toBe(validUser.name);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('requires email field', async () => {
      const user = new User({
        name: validUser.name,
        passwordHash: validUser.password,
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('requires unique email', async () => {
      await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      await expect(
        User.create({
          email: validUser.email,
          name: 'Duplicate User',
          passwordHash: 'AnotherPass123!',
        })
      ).rejects.toThrow();
    });

    it('lowercases email on save', async () => {
      const user = await User.create({
        email: 'TEST@EXAMPLE.COM',
        name: validUser.name,
        passwordHash: validUser.password,
      });

      expect(user.email).toBe('test@example.com');
    });

    it('trims name on save', async () => {
      const user = await User.create({
        email: validUser.email,
        name: '  Test User  ',
        passwordHash: validUser.password,
      });

      expect(user.name).toBe('Test User');
    });
  });

  describe('password hashing', () => {
    it('hashes password on save', async () => {
      const user = await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      // The stored hash should not be the plain-text password
      expect(user.passwordHash).not.toBe(validUser.password);
      // bcrypt hashes start with $2a$ or $2b$
      expect(user.passwordHash).toMatch(/^\$2[ab]\$/);
    });

    it('comparePassword returns true for correct password', async () => {
      const user = await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      const isMatch = await user.comparePassword(validUser.password);
      expect(isMatch).toBe(true);
    });

    it('comparePassword returns false for incorrect password', async () => {
      const user = await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      const isMatch = await user.comparePassword('WrongPassword123!');
      expect(isMatch).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('excludes passwordHash and refreshToken', async () => {
      const user = await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      const json = user.toJSON();

      expect(json.passwordHash).toBeUndefined();
      expect(json.refreshToken).toBeUndefined();
      expect(json.githubToken).toBeUndefined();
      expect(json.__v).toBeUndefined();
      expect(json.email).toBe(validUser.email);
      expect(json.name).toBe(validUser.name);
    });
  });

  describe('defaults', () => {
    it('defaults role to user', async () => {
      const user = await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      expect(user.role).toBe('user');
    });

    it('defaults plan to free', async () => {
      const user = await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      expect(user.plan).toBe('free');
    });

    it('allows setting role to admin', async () => {
      const user = await User.create({
        email: adminUser.email,
        name: adminUser.name,
        passwordHash: adminUser.password,
        role: adminUser.role,
      });

      expect(user.role).toBe('admin');
    });

    it('initializes tokenUsage with default values', async () => {
      const user = await User.create({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
      });

      expect(user.tokenUsage.used).toBe(0);
      expect(user.tokenUsage.limit).toBe(500000);
      expect(user.tokenUsage.resetAt).toBeDefined();
    });
  });

  describe('validation', () => {
    it('rejects invalid role values', async () => {
      const user = new User({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
        role: 'superadmin',
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    it('rejects invalid plan values', async () => {
      const user = new User({
        email: validUser.email,
        name: validUser.name,
        passwordHash: validUser.password,
        plan: 'platinum',
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.plan).toBeDefined();
    });

    it('rejects name exceeding maxlength', async () => {
      const user = new User({
        email: validUser.email,
        name: 'A'.repeat(101),
        passwordHash: validUser.password,
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });
  });
});
