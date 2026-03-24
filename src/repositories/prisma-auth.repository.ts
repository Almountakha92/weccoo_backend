import { randomUUID } from 'crypto';
import type { UserEntity } from '../entities';
import type { IAuthRepository } from '../interfaces/auth-repository.interface';
import { prisma } from '../config/prisma';

const toUserEntity = (user: any): UserEntity => ({
  id: user.id,
  fullName: user.fullName,
  university: user.university,
  email: user.email,
  whatsappPhone: user.whatsappPhone ?? '',
  password: user.password,
  role: user.role,
  campusId: user.campusId ?? null,
  suspendedAt: user.suspendedAt ? user.suspendedAt.toISOString() : null,
  mfaEnabled: user.mfaEnabled ?? false,
  mfaSecret: user.mfaSecret ?? null,
  mfaTempSecret: user.mfaTempSecret ?? null,
  createdAt: user.createdAt.toISOString()
});

export class PrismaAuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        fullName: true,
        university: true,
        email: true,
        whatsappPhone: true,
        password: true,
        role: true,
        campusId: true,
        suspendedAt: true,
        mfaEnabled: true,
        mfaSecret: true,
        mfaTempSecret: true,
        createdAt: true
      } as any
    });

    return user ? toUserEntity(user as any) : null;
  }

  async create(user: Omit<UserEntity, 'id' | 'createdAt'>): Promise<UserEntity> {
    const created = await prisma.user.create({
      data: {
        id: randomUUID(),
        fullName: user.fullName,
        university: user.university,
        email: user.email.toLowerCase(),
        whatsappPhone: user.whatsappPhone,
        password: user.password,
        role: (user as any).role ?? 'student',
        campusId: (user as any).campusId ?? null,
        createdAt: new Date()
      } as any,
      select: {
        id: true,
        fullName: true,
        university: true,
        email: true,
        whatsappPhone: true,
        password: true,
        role: true,
        campusId: true,
        suspendedAt: true,
        mfaEnabled: true,
        mfaSecret: true,
        mfaTempSecret: true,
        createdAt: true
      } as any
    });

    return toUserEntity(created as any);
  }
}
