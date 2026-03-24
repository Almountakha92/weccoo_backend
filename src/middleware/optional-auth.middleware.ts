import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../utils/token';

export const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  try {
    const payload = verifyAuthToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role ?? 'student',
      campusId: payload.campusId ?? null,
      mfa: payload.mfa ?? false
    };
  } catch {
    // ignore invalid token for optional auth
  }

  return next();
};

