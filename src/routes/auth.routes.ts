import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { PrismaAuthRepository } from '../repositories/prisma-auth.repository';
import { AuthService } from '../services/auth.service';

const repository = new PrismaAuthRepository();
const service = new AuthService(repository);
const controller = new AuthController(service);

export const authRouter = Router();

authRouter.get('/', (_req, res) => {
  return res.status(200).json({
    message: 'Auth routes initialized',
    data: { module: 'auth' }
  });
});

authRouter.post('/signup', controller.signup);
authRouter.post('/login', controller.login);
authRouter.post('/verify-university-email', controller.verifyUniversityEmail);
