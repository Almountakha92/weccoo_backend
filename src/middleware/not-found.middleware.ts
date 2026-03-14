import type { Request, Response } from 'express';
import { appMessages } from '../messages';

export const notFoundMiddleware = (_req: Request, res: Response) => {
  return res.status(404).json({
    message: appMessages.common.notFound,
    data: null
  });
};
