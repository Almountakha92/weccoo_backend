import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdminMfa, requireRole } from '../middleware/require-role.middleware';
import { PrismaAdminRepository } from '../repositories/prisma-admin.repository';
import { AdminService } from '../services/admin.service';

const repository = new PrismaAdminRepository();
const service = new AdminService(repository);
const controller = new AdminController(service);

export const adminRouter = Router();

// super_admin only
adminRouter.get('/campuses', authMiddleware, requireRole('super_admin'), requireAdminMfa, controller.listCampuses);
adminRouter.post('/campuses', authMiddleware, requireRole('super_admin'), requireAdminMfa, controller.createCampus);

adminRouter.get('/campus-admins', authMiddleware, requireRole('super_admin'), requireAdminMfa, controller.listCampusAdmins);
adminRouter.post('/campus-admins', authMiddleware, requireRole('super_admin'), requireAdminMfa, controller.createCampusAdmin);
adminRouter.patch(
  '/campus-admins/:id/suspend',
  authMiddleware,
  requireRole('super_admin'),
  requireAdminMfa,
  controller.setCampusAdminSuspended
);
adminRouter.post(
  '/campus-admins/:id/reset-mfa',
  authMiddleware,
  requireRole('super_admin'),
  requireAdminMfa,
  controller.resetCampusAdminMfa
);

// super_admin or campus_admin
adminRouter.get(
  '/users',
  authMiddleware,
  requireRole('super_admin', 'campus_admin'),
  requireAdminMfa,
  controller.listUsersByCampus
);

adminRouter.get(
  '/students',
  authMiddleware,
  requireRole('super_admin', 'campus_admin'),
  requireAdminMfa,
  controller.listStudentsByCampus
);

adminRouter.patch(
  '/students/:id/suspend',
  authMiddleware,
  requireRole('super_admin', 'campus_admin'),
  requireAdminMfa,
  controller.suspendStudent
);

adminRouter.delete(
  '/students/:id',
  authMiddleware,
  requireRole('super_admin'),
  requireAdminMfa,
  controller.deleteStudent
);

adminRouter.patch('/users/:id/campus', authMiddleware, requireRole('super_admin'), requireAdminMfa, controller.setUserCampus);

adminRouter.get('/audit-logs', authMiddleware, requireRole('super_admin'), requireAdminMfa, controller.listAuditLogs);
