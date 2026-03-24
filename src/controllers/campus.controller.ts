import type { NextFunction, Request, Response } from 'express';
import type { CampusService } from '../services/campus.service';
import { ok } from '../utils/response';

export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const campuses = await this.campusService.listCampuses();
      return res.status(200).json(ok('OK', campuses));
    } catch (error) {
      return next(error);
    }
  };
}

