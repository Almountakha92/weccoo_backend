import type { ConversationEntity, MessageEntity } from '../entities';

export interface IMessageRepository {
  findConversationsByUserId(userId: string): Promise<ConversationEntity[]>;
  findMessagesByConversationId(conversationId: string): Promise<MessageEntity[]>;
  createMessage(message: Omit<MessageEntity, 'id' | 'sentAt'>): Promise<MessageEntity>;
  findConversationById(conversationId: string): Promise<ConversationEntity | null>;
}
