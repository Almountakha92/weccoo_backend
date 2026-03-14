import type { SendMessageRequestDto } from '../dto/message.dto';
import type { IMessageRepository } from '../interfaces/message-repository.interface';
import { appMessages } from '../messages';
import { HttpError } from '../utils/http-error';

export class MessageService {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async findConversationsByUserId(userId: string) {
    return this.messageRepository.findConversationsByUserId(userId);
  }

  async findMessagesByConversationId(conversationId: string, requesterId: string) {
    const conversation = await this.messageRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    if (!conversation.participantIds.includes(requesterId)) {
      throw new HttpError(403, appMessages.common.unauthorized);
    }

    return this.messageRepository.findMessagesByConversationId(conversationId);
  }

  async sendMessage(conversationId: string, senderId: string, payload: SendMessageRequestDto) {
    const conversation = await this.messageRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    if (!conversation.participantIds.includes(senderId)) {
      throw new HttpError(403, appMessages.common.unauthorized);
    }

    return this.messageRepository.createMessage({
      conversationId,
      senderId,
      text: payload.text
    });
  }
}
