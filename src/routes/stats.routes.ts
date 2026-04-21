import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { optionalAuthMiddleware } from '../middleware/optional-auth.middleware';
import { StatsService } from '../services/stats.service';

const service = new StatsService();
const controller = new StatsController(service);

export const statsRouter = Router();

statsRouter.get('/', optionalAuthMiddleware, controller.get);
