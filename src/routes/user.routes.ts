import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { UserService } from '../services/user.service';

const repository = new PrismaUserRepository();
const service = new UserService(repository);
const controller = new UserController(service);

export const userRouter = Router();

userRouter.patch('/me', authMiddleware, controller.updateMe);

