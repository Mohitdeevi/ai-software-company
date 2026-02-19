export const validUser = {
  email: 'test@example.com',
  password: 'Password123!',
  name: 'Test User',
};

export const adminUser = {
  email: 'admin@example.com',
  password: 'AdminPass123!',
  name: 'Admin User',
  role: 'admin',
};

export const invalidUsers = [
  {
    description: 'missing email',
    data: { password: 'Password123!', name: 'No Email' },
  },
  {
    description: 'invalid email format',
    data: { email: 'not-an-email', password: 'Password123!', name: 'Bad Email' },
  },
  {
    description: 'missing password',
    data: { email: 'nopass@example.com', name: 'No Password' },
  },
  {
    description: 'password too short',
    data: { email: 'short@example.com', password: 'Ab1!', name: 'Short Pass' },
  },
  {
    description: 'missing name',
    data: { email: 'noname@example.com', password: 'Password123!' },
  },
  {
    description: 'name exceeds max length',
    data: {
      email: 'longname@example.com',
      password: 'Password123!',
      name: 'A'.repeat(101),
    },
  },
  {
    description: 'empty body',
    data: {},
  },
];
