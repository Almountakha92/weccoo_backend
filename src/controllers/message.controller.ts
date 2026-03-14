import type { NextFunction, Request, Response } from 'express';
import type { SendMessageRequestDto } from '../dto/message.dto';
import { appMessages } from '../messages';
import type { MessageService } from '../services/message.service';
import { HttpError } from '../utils/http-error';
import { ok } from '../utils/response';

export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  getConversationsByUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.id !== req.params.userId) {
        throw new HttpError(403, appMessages.common.unauthorized);
      }

      const conversations = await this.messageService.findConversationsByUserId(req.params.userId);
      return res.status(200).json(ok(appMessages.messages.conversationListFetched, conversations));
    } catch (error) {
      return next(error);
    }
  };

  getConversationMessages = async (req: Request<{ conversationId: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new HttpError(401, appMessages.common.unauthorized);
      }

      const messages = await this.messageService.findMessagesByConversationId(req.params.conversationId, req.user.id);
      return res.status(200).json(ok(appMessages.messages.messageListFetched, messages));
    } catch (error) {
      return next(error);
    }
  };

  sendMessage = async (
    req: Request<{ conversationId: string }, unknown, SendMessageRequestDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new HttpError(401, appMessages.common.unauthorized);
      }

      const message = await this.messageService.sendMessage(req.params.conversationId, req.user.id, req.body);
      return res.status(201).json(ok(appMessages.messages.sent, message));
    } catch (error) {
      return next(error);
    }
  };
}
