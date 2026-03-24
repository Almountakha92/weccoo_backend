import 'express';
import type { UserRole } from './user-role';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        campusId?: string | null;
        mfa?: boolean;
      };
    }
  }
}

export {};
