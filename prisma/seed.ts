import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { itemsSeed, usersSeed } from '../src/seeders/entities.seed';
import { hashPassword } from '../src/utils/password';

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

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? '';
  const superAdminName = process.env.SUPER_ADMIN_NAME ?? 'Super Admin';

  if (superAdminEmail && superAdminPassword.length >= 8) {
    await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {
        fullName: superAdminName,
        email: superAdminEmail,
        password: hashPassword(superAdminPassword),
        role: 'super_admin',
        campusId: null,
        suspendedAt: null,
        mfaEnabled: false,
        mfaSecret: null,
        mfaTempSecret: null
      } as any,
      create: {
        id: `sa_${Date.now()}`,
        fullName: superAdminName,
        university: 'WECCOO',
        email: superAdminEmail,
        whatsappPhone: null,
        password: hashPassword(superAdminPassword),
        role: 'super_admin',
        campusId: null,
        suspendedAt: null,
        mfaEnabled: false,
        mfaSecret: null,
        mfaTempSecret: null,
        createdAt: new Date()
      } as any
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
