import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authRouter } from './auth.routes';
import { itemRouter } from './item.routes';
import { messageRouter } from './message.routes';
import { statsRouter } from './stats.routes';
import { userRouter } from './user.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  return res.status(200).json({ message: 'Backend is running', data: null });
});

apiRouter.get('/health/database', async (_req, res) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return res.status(200).json({
      message: 'Database is reachable',
      data: { database: 'up' }
    });
  } catch {
    return res.status(503).json({
      message: 'Database is not reachable',
      data: { database: 'down' }
    });
  }
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/items', itemRouter);
apiRouter.use('/messages', messageRouter);
apiRouter.use('/stats', statsRouter);
