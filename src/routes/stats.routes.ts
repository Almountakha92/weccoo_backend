import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { StatsService } from '../services/stats.service';

const service = new StatsService();
const controller = new StatsController(service);

export const statsRouter = Router();

statsRouter.get('/', controller.get);

