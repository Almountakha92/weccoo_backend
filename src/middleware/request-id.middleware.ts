import type { NextFunction, Request, Response } from 'express';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  res.setHeader('x-request-id', requestId);
  next();
};
