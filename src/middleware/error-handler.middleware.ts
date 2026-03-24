import type { NextFunction, Request, Response } from 'express';
import { appMessages } from '../messages';
import { HttpError } from '../utils/http-error';

type BodyParserError = {
  type?: string;
  status?: number;
  message?: string;
};

export const errorHandlerMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // eslint-disable-next-line no-console
  console.error(error);

  const prismaInitError = error as { name?: string };
  if (prismaInitError?.name === 'PrismaClientInitializationError') {
    return res.status(503).json({
      message: appMessages.common.databaseUnavailable,
      data: null
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message,
      data: null
    });
  }

  const maybeBodyParserError = error as BodyParserError;
  if (maybeBodyParserError?.type === 'entity.too.large' || maybeBodyParserError?.status === 413) {
    return res.status(413).json({
      message: 'Payload trop volumineux. Réduis la taille/le nombre de photos.',
      data: null
    });
  }

  return res.status(500).json({
    message: appMessages.common.internalError,
    data: null
  });
};
