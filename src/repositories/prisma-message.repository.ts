import { randomUUID } from 'crypto';
import type { ConversationEntity, MessageEntity } from '../entities';
import type { IMessageRepository } from '../interfaces/message-repository.interface';
import { prisma } from '../config/prisma';

const toConversationEntity = (conversation: {
  id: string;
  participantAId: string;
  participantBId: string;
  itemId: string;
  createdAt: Date;
}): ConversationEntity => ({
  id: conversation.id,
  participantIds: [conversation.participantAId, conversation.participantBId],
  itemId: conversation.itemId,
  createdAt: conversation.createdAt.toISOString()
});

const toMessageEntity = (message: {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: Date;
}): MessageEntity => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  text: message.text,
  sentAt: message.sentAt.toISOString()
});

export class PrismaMessageRepository implements IMessageRepository {
  async findConversationsByUserId(userId: string): Promise<ConversationEntity[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: userId }, { participantBId: userId }]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return conversations.map(toConversationEntity);
  }

  async findMessagesByConversationId(conversationId: string): Promise<MessageEntity[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: {
        sentAt: 'asc'
      }
    });

    return messages.map(toMessageEntity);
  }

  async createMessage(message: Omit<MessageEntity, 'id' | 'sentAt'>): Promise<MessageEntity> {
    const created = await prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId: message.conversationId,
        senderId: message.senderId,
        text: message.text,
        sentAt: new Date()
      }
    });

    return toMessageEntity(created);
  }

  async findConversationById(conversationId: string): Promise<ConversationEntity | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    return conversation ? toConversationEntity(conversation) : null;
  }
}
