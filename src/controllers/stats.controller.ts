import type { NextFunction, Request, Response } from 'express';
import { appMessages } from '../messages';
import { ok } from '../utils/response';
import type { StatsService } from '../services/stats.service';

export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.statsService.getStats(
        req.user
          ? {
              role: req.user.role,
              campusId: req.user.campusId ?? null
            }
          : undefined
      );
      return res.status(200).json(ok(appMessages.stats.fetched, stats));
    } catch (error) {
      return next(error);
    }
  };
}
