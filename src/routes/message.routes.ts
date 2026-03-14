import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { PrismaMessageRepository } from '../repositories/prisma-message.repository';
import { MessageService } from '../services/message.service';

const repository = new PrismaMessageRepository();
const service = new MessageService(repository);
const controller = new MessageController(service);

export const messageRouter = Router();

messageRouter.get('/conversations/:userId', authMiddleware, controller.getConversationsByUser);
messageRouter.get('/conversations/:conversationId/messages', authMiddleware, controller.getConversationMessages);
messageRouter.post('/conversations/:conversationId/messages', authMiddleware, controller.sendMessage);
