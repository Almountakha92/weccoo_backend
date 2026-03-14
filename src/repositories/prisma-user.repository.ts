import { prisma } from '../config/prisma';

export class PrismaUserRepository {
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        university: true,
        whatsappPhone: true,
        password: true,
        createdAt: true
      } as any
    }) as any;
  }

  async update(userId: string, data: { whatsappPhone?: string | null; password?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data: data as any,
      select: {
        id: true,
        fullName: true,
        email: true,
        university: true,
        whatsappPhone: true,
        password: true,
        createdAt: true
      } as any
    }) as any;
  }
}

