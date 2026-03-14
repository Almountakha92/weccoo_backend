import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { conversationsSeed, itemsSeed, messagesSeed, usersSeed } from '../src/seeders/entities.seed';

const prisma = new PrismaClient();

async function main() {
  for (const user of usersSeed) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        fullName: user.fullName,
        university: user.university,
        email: user.email,
        whatsappPhone: user.whatsappPhone,
        password: user.password,
        createdAt: new Date(user.createdAt)
      },
      create: {
        id: user.id,
        fullName: user.fullName,
        university: user.university,
        email: user.email,
        whatsappPhone: user.whatsappPhone,
        password: user.password,
        createdAt: new Date(user.createdAt)
      }
    });
  }

  for (const item of itemsSeed) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        category: item.category,
        description: item.description,
        condition: item.condition,
        type: item.type,
        location: item.location,
        ownerId: item.ownerId,
        createdAt: new Date(item.createdAt)
      },
      create: {
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        condition: item.condition,
        type: item.type,
        location: item.location,
        ownerId: item.ownerId,
        createdAt: new Date(item.createdAt)
      }
    });
  }

  for (const conversation of conversationsSeed) {
    await prisma.conversation.upsert({
      where: { id: conversation.id },
      update: {
        participantAId: conversation.participantIds[0],
        participantBId: conversation.participantIds[1],
        itemId: conversation.itemId,
        createdAt: new Date(conversation.createdAt)
      },
      create: {
        id: conversation.id,
        participantAId: conversation.participantIds[0],
        participantBId: conversation.participantIds[1],
        itemId: conversation.itemId,
        createdAt: new Date(conversation.createdAt)
      }
    });
  }

  for (const message of messagesSeed) {
    await prisma.message.upsert({
      where: { id: message.id },
      update: {
        conversationId: message.conversationId,
        senderId: message.senderId,
        text: message.text,
        sentAt: new Date(message.sentAt)
      },
      create: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        text: message.text,
        sentAt: new Date(message.sentAt)
      }
    });
  }

  // eslint-disable-next-line no-console
  console.log('Prisma seed completed.');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
