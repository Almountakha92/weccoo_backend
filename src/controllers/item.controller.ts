import type { NextFunction, Request, Response } from 'express';
import type { CreateItemRequestDto } from '../dto/item.dto';
import { appMessages } from '../messages';
import type { ItemService } from '../services/item.service';
import { HttpError } from '../utils/http-error';
import { ok } from '../utils/response';

export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.itemService.findAll(req.user ? { userId: req.user.id, campusId: req.user.campusId } : undefined);
      return res.status(200).json(ok(appMessages.items.listFetched, items));
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const item = await this.itemService.findById(req.params.id, req.user ? { userId: req.user.id, role: req.user.role, campusId: req.user.campusId } : undefined);
      return res.status(200).json(ok(appMessages.items.detailFetched, item));
    } catch (error) {
      return next(error);
    }
  };

  create = async (req: Request<unknown, unknown, CreateItemRequestDto>, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpError(401, appMessages.common.unauthorized);
      }

      const item = await this.itemService.create({
        ...req.body,
        ownerId: req.user.id,
        ownerRole: req.user.role
      });
      return res.status(201).json(ok(appMessages.items.created, item));
    } catch (error) {
      return next(error);
    }
  };

  archive = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpError(401, appMessages.common.unauthorized);
      }

      const item = await this.itemService.archive(req.params.id, req.user.id);
      return res.status(200).json(ok(appMessages.items.archived, item));
    } catch (error) {
      return next(error);
    }
  };

  registerView = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const item = await this.itemService.registerView(req.params.id, req.user ? {
        viewerId: req.user.id,
        role: req.user.role,
        campusId: req.user.campusId ?? null
      } : undefined);
      return res.status(200).json(ok(appMessages.common.ok, item));
    } catch (error) {
      return next(error);
    }
  };

  toggleLike = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpError(401, appMessages.common.unauthorized);
      }

      const result = await this.itemService.toggleLike(req.params.id, {
        userId: req.user.id,
        role: req.user.role,
        campusId: req.user.campusId ?? null
      });
      return res.status(200).json(ok(appMessages.common.ok, result));
    } catch (error) {
      return next(error);
    }
  };

  getLikesReceived = async (
    req: Request<{ userId: string }, unknown, unknown, { limit?: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || req.user.id !== req.params.userId) {
        throw new HttpError(403, appMessages.common.unauthorized);
      }

      const limit = req.query?.limit ? Number(req.query.limit) : undefined;
      const likes = await this.itemService.findLikesReceivedByOwnerId(req.params.userId, limit);
      return res.status(200).json(ok(appMessages.common.ok, likes));
    } catch (error) {
      return next(error);
    }
  };
}
