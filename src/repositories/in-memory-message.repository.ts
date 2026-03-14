import { conversationsSeed, messagesSeed } from '../data/seed';
import type { IMessageRepository } from '../interfaces/message-repository.interface';
import type { ConversationEntity, MessageEntity } from '../entities';

export class InMemoryMessageRepository implements IMessageRepository {
  private readonly conversations: ConversationEntity[] = [...conversationsSeed];
  private readonly messages: MessageEntity[] = [...messagesSeed];

  async findConversationsByUserId(userId: string): Promise<ConversationEntity[]> {
    return this.conversations.filter((conversation) => conversation.participantIds.includes(userId));
  }

  async findMessagesByConversationId(conversationId: string): Promise<MessageEntity[]> {
    return this.messages
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  }

  async createMessage(message: Omit<MessageEntity, 'id' | 'sentAt'>): Promise<MessageEntity> {
    const created: MessageEntity = {
      id: `m${this.messages.length + 1}`,
      sentAt: new Date().toISOString(),
      ...message
    };
    this.messages.push(created);
    return created;
  }

  async findConversationById(conversationId: string): Promise<ConversationEntity | null> {
    const conversation = this.conversations.find((entry) => entry.id === conversationId);
    return conversation ?? null;
  }
}
