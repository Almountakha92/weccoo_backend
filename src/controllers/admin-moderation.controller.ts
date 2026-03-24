import type { NextFunction, Request, Response } from 'express';
import type { AdminModerationService } from '../services/admin-moderation.service';
import { ok } from '../utils/response';

export class AdminModerationController {
  constructor(private readonly moderationService: AdminModerationService) {}

  listItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
      const campusId = typeof req.query.campusId === 'string' ? req.query.campusId : undefined;

      const items = await this.moderationService.listItems({
        requester: {
          id: req.user!.id,
          role: req.user!.role as any,
          campusId: req.user!.campusId ?? null
        },
        status,
        studentId,
        campusId
      });
      return res.status(200).json(ok('OK', items));
    } catch (error) {
      return next(error);
    }
  };

  approve = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const note = typeof (req.body as any)?.note === 'string' ? (req.body as any).note : undefined;
      const result = await this.moderationService.setModeration({
        requester: {
          id: req.user!.id,
          role: req.user!.role as any,
          campusId: req.user!.campusId ?? null,
          email: req.user!.email
        },
        itemId: req.params.id,
        status: 'approved',
        note
      });
      return res.status(200).json(ok('OK', result));
    } catch (error) {
      return next(error);
    }
  };

  reject = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const note = typeof (req.body as any)?.note === 'string' ? (req.body as any).note : undefined;
      const result = await this.moderationService.setModeration({
        requester: {
          id: req.user!.id,
          role: req.user!.role as any,
          campusId: req.user!.campusId ?? null,
          email: req.user!.email
        },
        itemId: req.params.id,
        status: 'rejected',
        note
      });
      return res.status(200).json(ok('OK', result));
    } catch (error) {
      return next(error);
    }
  };

  archive = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const result = await this.moderationService.archiveItem({
        requester: {
          id: req.user!.id,
          role: req.user!.role as any,
          campusId: req.user!.campusId ?? null,
          email: req.user!.email
        },
        itemId: req.params.id
      });
      return res.status(200).json(ok('OK', result));
    } catch (error) {
      return next(error);
    }
  };
}
