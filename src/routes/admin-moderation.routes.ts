import { Router } from 'express';
import { AdminModerationController } from '../controllers/admin-moderation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdminMfa, requireRole } from '../middleware/require-role.middleware';
import { PrismaAdminRepository } from '../repositories/prisma-admin.repository';
import { AdminModerationService } from '../services/admin-moderation.service';

const adminRepository = new PrismaAdminRepository();
const service = new AdminModerationService(adminRepository);
const controller = new AdminModerationController(service);

export const adminModerationRouter = Router();

adminModerationRouter.get(
  '/items',
  authMiddleware,
  requireRole('super_admin', 'campus_admin'),
  requireAdminMfa,
  controller.listItems
);

adminModerationRouter.patch(
  '/items/:id/approve',
  authMiddleware,
  requireRole('super_admin', 'campus_admin'),
  requireAdminMfa,
  controller.approve
);

adminModerationRouter.patch(
  '/items/:id/reject',
  authMiddleware,
  requireRole('super_admin', 'campus_admin'),
  requireAdminMfa,
  controller.reject
);

adminModerationRouter.patch(
  '/items/:id/archive',
  authMiddleware,
  requireRole('super_admin', 'campus_admin'),
  requireAdminMfa,
  controller.archive
);
