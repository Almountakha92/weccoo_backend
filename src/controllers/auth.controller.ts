import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../services/auth.service';
import type { LoginRequestDto, SignupRequestDto } from '../dto/auth.dto';
import { appMessages } from '../messages';
import type { VerifyUniversityEmailRequestDto } from '../dto/university-email.dto';
import { HttpError } from '../utils/http-error';
import { isUniversityEmailInDb } from '../utils/university-email-db';
import { ok } from '../utils/response';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  verifyUniversityEmail = async (
    req: Request<unknown, unknown, VerifyUniversityEmailRequestDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const email = req.body?.email?.trim();
      const university = req.body?.university?.trim();

      if (!email || !university) {
        throw new HttpError(400, appMessages.common.invalidPayload);
      }

      try {
        const exists = isUniversityEmailInDb(university, email);
        return res.status(200).json(ok(appMessages.common.ok, { exists }));
      } catch {
        throw new HttpError(500, "Base d'emails universitaires indisponible.");
      }
    } catch (error) {
      return next(error);
    }
  };

  signup = async (req: Request<unknown, unknown, SignupRequestDto>, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.signup(req.body);
      return res.status(201).json(ok(appMessages.auth.signupSuccess, result));
    } catch (error) {
      return next(error);
    }
  };

  login = async (req: Request<unknown, unknown, LoginRequestDto>, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      return res.status(200).json(ok(appMessages.auth.loginSuccess, result));
    } catch (error) {
      return next(error);
    }
  };
}
