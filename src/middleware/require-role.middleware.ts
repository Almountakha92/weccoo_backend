import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../types/user-role';
import { HttpError } from '../utils/http-error';
import { appMessages } from '../messages';
import { env } from '../config/env';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpError(401, appMessages.common.unauthorized);
      }

      if (!roles.includes(req.user.role)) {
        throw new HttpError(403, 'Acces interdit.');
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const requireAdminMfa = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, appMessages.common.unauthorized);
    }

    if (!env.adminMfaRequired) {
      return next();
    }

    if (req.user.role !== 'student' && req.user.mfa !== true) {
      throw new HttpError(401, 'MFA requis pour acceder a l’administration.');
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
