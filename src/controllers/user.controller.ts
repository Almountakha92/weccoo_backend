import type { NextFunction, Request, Response } from 'express';
import type { UpdateMeRequestDto } from '../dto/user.dto';
import { appMessages } from '../messages';
import type { UserService } from '../services/user.service';
import { HttpError } from '../utils/http-error';
import { ok } from '../utils/response';

export class UserController {
  constructor(private readonly userService: UserService) {}

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpError(401, appMessages.common.unauthorized);
      }

      const updated = await this.userService.updateMe(req.user.id, req.body as UpdateMeRequestDto);
      return res.status(200).json(ok(appMessages.common.ok, updated));
    } catch (error) {
      return next(error);
    }
  };
}

