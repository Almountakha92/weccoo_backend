import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { optionalAuthMiddleware } from '../middleware/optional-auth.middleware';
import { PrismaItemRepository } from '../repositories/prisma-item.repository';
import { ItemService } from '../services/item.service';

const repository = new PrismaItemRepository();
const service = new ItemService(repository);
const controller = new ItemController(service);

export const itemRouter = Router();

itemRouter.get('/', authMiddleware, controller.getAll);
itemRouter.get('/received-likes/:userId', authMiddleware, controller.getLikesReceived);
itemRouter.get('/:id', authMiddleware, controller.getById);
itemRouter.post('/:id/view', authMiddleware, controller.registerView);
itemRouter.post('/:id/like', authMiddleware, controller.toggleLike);
itemRouter.post('/', authMiddleware, controller.create);
itemRouter.patch('/:id/archive', authMiddleware, controller.archive);
