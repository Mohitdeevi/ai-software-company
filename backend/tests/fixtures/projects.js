export const validProject = {
  name: 'Test App',
  prompt:
    'Build a todo application with user authentication and CRUD operations',
};

export const invalidProjects = [
  {
    description: 'missing name',
    data: {
      prompt: 'Build a todo application with user authentication and CRUD operations',
    },
  },
  {
    description: 'missing prompt',
    data: { name: 'Test App' },
  },
  {
    description: 'prompt too short (under 10 chars)',
    data: { name: 'Test App', prompt: 'Short' },
  },
  {
    description: 'name exceeds max length',
    data: {
      name: 'A'.repeat(201),
      prompt: 'Build a todo application with user authentication and CRUD operations',
    },
  },
  {
    description: 'empty body',
    data: {},
  },
  {
    description: 'prompt exceeds max length',
    data: {
      name: 'Test App',
      prompt: 'X'.repeat(10001),
    },
  },
];
