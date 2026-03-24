import type { NextFunction, Request, Response } from 'express';
import type { CreateCampusAdminRequestDto, CreateCampusRequestDto } from '../dto/admin.dto';
import type { AdminService } from '../services/admin.service';
import { appMessages } from '../messages';
import { HttpError } from '../utils/http-error';
import { ok } from '../utils/response';

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  createCampus = async (req: Request<unknown, unknown, CreateCampusRequestDto>, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const campus = await this.adminService.createCampus(
        { id: req.user.id, email: req.user.email },
        req.body,
        { ip: req.ip, userAgent: req.headers['user-agent'] }
      );

      return res.status(201).json(ok('OK', campus));
    } catch (error) {
      return next(error);
    }
  };

  listCampuses = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const campuses = await this.adminService.listCampuses();
      return res.status(200).json(ok('OK', campuses));
    } catch (error) {
      return next(error);
    }
  };

  createCampusAdmin = async (
    req: Request<unknown, unknown, CreateCampusAdminRequestDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const created = await this.adminService.createCampusAdmin(
        { id: req.user.id, email: req.user.email },
        req.body,
        { ip: req.ip, userAgent: req.headers['user-agent'] }
      );

      return res.status(201).json(ok('OK', created));
    } catch (error) {
      return next(error);
    }
  };

  listCampusAdmins = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await this.adminService.listCampusAdmins();
      return res.status(200).json(ok('OK', admins));
    } catch (error) {
      return next(error);
    }
  };

  setCampusAdminSuspended = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const campusAdminId = req.params.id;
      const suspended = Boolean((req.body as any)?.suspended);

      const updated = await this.adminService.suspendCampusAdmin(
        { id: req.user.id, email: req.user.email },
        campusAdminId,
        suspended,
        { ip: req.ip, userAgent: req.headers['user-agent'] }
      );

      return res.status(200).json(ok('OK', updated));
    } catch (error) {
      return next(error);
    }
  };

  resetCampusAdminMfa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const campusAdminId = req.params.id;
      const result = await this.adminService.resetCampusAdminMfa(
        { id: req.user.id, email: req.user.email },
        campusAdminId,
        { ip: req.ip, userAgent: req.headers['user-agent'] }
      );

      return res.status(200).json(ok('OK', result));
    } catch (error) {
      return next(error);
    }
  };

  listUsersByCampus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const campusId = typeof req.query.campusId === 'string' ? req.query.campusId : undefined;
      const users = await this.adminService.listUsersByCampus(
        { role: req.user.role as any, campusId: req.user.campusId ?? null },
        campusId
      );

      return res.status(200).json(ok('OK', users));
    } catch (error) {
      return next(error);
    }
  };

  listStudentsByCampus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const campusId = typeof req.query.campusId === 'string' ? req.query.campusId : undefined;
      const users = await this.adminService.listStudentsByCampus(
        { role: req.user.role as any, campusId: req.user.campusId ?? null },
        campusId
      );

      return res.status(200).json(ok('OK', users));
    } catch (error) {
      return next(error);
    }
  };

  suspendStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const studentId = req.params.id;
      const suspended = Boolean((req.body as any)?.suspended);

      const updated = await this.adminService.suspendStudent(
        { id: req.user.id, email: req.user.email, role: req.user.role as any, campusId: req.user.campusId ?? null },
        studentId,
        suspended,
        { ip: req.ip, userAgent: req.headers['user-agent'] }
      );

      return res.status(200).json(ok('OK', updated));
    } catch (error) {
      return next(error);
    }
  };

  deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const studentId = req.params.id;
      const result = await this.adminService.deleteStudent(
        { id: req.user.id, email: req.user.email },
        studentId,
        { ip: req.ip, userAgent: req.headers['user-agent'] }
      );

      return res.status(200).json(ok('OK', result));
    } catch (error) {
      return next(error);
    }
  };

  setUserCampus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, appMessages.common.unauthorized);

      const userId = req.params.id;
      const campusIdRaw = (req.body as any)?.campusId;
      const campusId = typeof campusIdRaw === 'string' ? campusIdRaw : campusIdRaw === null ? null : undefined;
      if (campusId === undefined) {
        throw new HttpError(400, appMessages.common.invalidPayload);
      }

      const updated = await this.adminService.setUserCampus(
        { id: req.user.id, email: req.user.email },
        userId,
        campusId,
        { ip: req.ip, userAgent: req.headers['user-agent'] }
      );

      return res.status(200).json(ok('OK', updated));
    } catch (error) {
      return next(error);
    }
  };

  listAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 50;
      const logs = await this.adminService.listAuditLogs(Number.isFinite(limit) ? limit : 50);
      return res.status(200).json(ok('OK', logs));
    } catch (error) {
      return next(error);
    }
  };
}
