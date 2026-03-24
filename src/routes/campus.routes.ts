import { Router } from 'express';
import { CampusController } from '../controllers/campus.controller';
import { PrismaCampusRepository } from '../repositories/prisma-campus.repository';
import { CampusService } from '../services/campus.service';

const repository = new PrismaCampusRepository();
const service = new CampusService(repository);
const controller = new CampusController(service);

export const campusRouter = Router();

campusRouter.get('/', controller.list);

