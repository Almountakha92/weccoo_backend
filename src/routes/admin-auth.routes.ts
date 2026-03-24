import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin-auth.controller';
import { PrismaAdminRepository } from '../repositories/prisma-admin.repository';
import { AdminAuthService } from '../services/admin-auth.service';

const repository = new PrismaAdminRepository();
const service = new AdminAuthService(repository);
const controller = new AdminAuthController(service);

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', controller.login);
adminAuthRouter.post('/mfa/confirm', controller.confirmMfa);

