export const userRoles = ['student', 'campus_admin', 'super_admin'] as const;

export type UserRole = (typeof userRoles)[number];

export const isUserRole = (value: unknown): value is UserRole => {
  return typeof value === 'string' && (userRoles as readonly string[]).includes(value);
};

