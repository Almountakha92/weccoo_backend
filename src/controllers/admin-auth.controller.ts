import type { NextFunction, Request, Response } from 'express';
import type { AdminLoginRequestDto, AdminMfaConfirmRequestDto } from '../dto/admin-auth.dto';
import type { AdminAuthService } from '../services/admin-auth.service';
import { ok } from '../utils/response';

export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  login = async (req: Request<unknown, unknown, AdminLoginRequestDto>, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminAuthService.login(req.body, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(200).json(ok('OK', result));
    } catch (error) {
      return next(error);
    }
  };

  confirmMfa = async (
    req: Request<unknown, unknown, AdminMfaConfirmRequestDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.adminAuthService.confirmMfa(req.body, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(200).json(ok('OK', result));
    } catch (error) {
      return next(error);
    }
  };
}

