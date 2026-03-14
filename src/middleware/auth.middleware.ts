import type { NextFunction, Request, Response } from 'express';
import { appMessages } from '../messages';
import { verifyAuthToken } from '../utils/token';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: appMessages.common.unauthorized,
      data: null
    });
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  try {
    const payload = verifyAuthToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email
    };
    return next();
  } catch {
    return res.status(401).json({
      message: appMessages.common.unauthorized,
      data: null
    });
  }
};
