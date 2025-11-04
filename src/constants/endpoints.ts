export const USERS_ENDPOINTS = {
  getAll: '/user',
  getById: (id: string) => `/user/${id}`,
  create: '/user',
  update: (id: string) => `/user/${id}`,
  delete: (id: string) => `/user/${id}`,
} as const;