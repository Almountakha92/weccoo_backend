import { randomUUID } from 'crypto';
import { prisma } from '../config/prisma';

export type AdminAuthUserRecord = {
  id: string;
  email: string;
  password: string;
  role: 'student' | 'campus_admin' | 'super_admin';
  campusId: string | null;
  suspendedAt: Date | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaTempSecret: string | null;
};

export class PrismaAdminRepository {
  async findAuthUserById(userId: string): Promise<AdminAuthUserRecord | null> {
    const user = (await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        campusId: true,
        suspendedAt: true,
        mfaEnabled: true,
        mfaSecret: true,
        mfaTempSecret: true
      } as any
    } as any)) as any;

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role as any,
      campusId: (user as any).campusId ?? null,
      suspendedAt: (user as any).suspendedAt ?? null,
      mfaEnabled: Boolean((user as any).mfaEnabled),
      mfaSecret: (user as any).mfaSecret ?? null,
      mfaTempSecret: (user as any).mfaTempSecret ?? null
    };
  }

  async findAuthUserByEmail(email: string): Promise<AdminAuthUserRecord | null> {
    const user = (await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        campusId: true,
        suspendedAt: true,
        mfaEnabled: true,
        mfaSecret: true,
        mfaTempSecret: true
      } as any
    } as any)) as any;

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role as any,
      campusId: (user as any).campusId ?? null,
      suspendedAt: (user as any).suspendedAt ?? null,
      mfaEnabled: Boolean((user as any).mfaEnabled),
      mfaSecret: (user as any).mfaSecret ?? null,
      mfaTempSecret: (user as any).mfaTempSecret ?? null
    };
  }

  async setMfaTempSecret(userId: string, secret: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { mfaTempSecret: secret } as any
    });
  }

  async enableMfaFromTempSecret(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaTempSecret: true } as any
    });

    const secret = (user as any)?.mfaTempSecret as string | null | undefined;
    if (!secret) return null;

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true, mfaSecret: secret, mfaTempSecret: null } as any
    });

    return secret;
  }

  async clearMfa(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null, mfaTempSecret: null } as any
    });
  }

  async createCampus(name: string) {
    return prisma.campus.create({
      data: { id: randomUUID(), name, createdAt: new Date() } as any,
      select: { id: true, name: true, createdAt: true } as any
    }) as any;
  }

  async listCampuses() {
    return prisma.campus.findMany({
      orderBy: { createdAt: 'desc' } as any,
      select: { id: true, name: true, createdAt: true } as any
    }) as any;
  }

  async createCampusAdmin(payload: {
    fullName: string;
    university: string;
    email: string;
    whatsappPhone?: string | null;
    password: string;
    campusId: string;
  }) {
    return prisma.user.create({
      data: {
        id: randomUUID(),
        fullName: payload.fullName,
        university: payload.university,
        email: payload.email.toLowerCase(),
        whatsappPhone: payload.whatsappPhone ?? null,
        password: payload.password,
        role: 'campus_admin',
        campusId: payload.campusId,
        createdAt: new Date()
      } as any,
      select: {
        id: true,
        fullName: true,
        university: true,
        email: true,
        whatsappPhone: true,
        role: true,
        campusId: true,
        suspendedAt: true,
        createdAt: true
      } as any
    }) as any;
  }

  async listCampusAdmins() {
    return prisma.user.findMany({
      where: { role: 'campus_admin' } as any,
      orderBy: { createdAt: 'desc' } as any,
      select: {
        id: true,
        fullName: true,
        university: true,
        email: true,
        whatsappPhone: true,
        role: true,
        campusId: true,
        suspendedAt: true,
        createdAt: true
      } as any
    }) as any;
  }

  async setUserSuspended(userId: string, suspended: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { suspendedAt: suspended ? new Date() : null } as any,
      select: { id: true, suspendedAt: true } as any
    }) as any;
  }

  async deleteUser(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
      select: { id: true } as any
    }) as any;
  }

  async setUserCampus(userId: string, campusId: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { campusId } as any,
      select: { id: true, campusId: true } as any
    }) as any;
  }

  async findUserForAdminAction(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, campusId: true, suspendedAt: true, email: true } as any
    }) as any;
  }

  async listUsersByCampus(campusId: string) {
    return prisma.user.findMany({
      where: { campusId } as any,
      orderBy: { createdAt: 'desc' } as any,
      select: {
        id: true,
        fullName: true,
        email: true,
        university: true,
        whatsappPhone: true,
        role: true,
        campusId: true,
        suspendedAt: true,
        createdAt: true
      } as any
    }) as any;
  }

  async listStudentsByCampus(campusId: string) {
    return prisma.user.findMany({
      where: { campusId, role: 'student' } as any,
      orderBy: { createdAt: 'desc' } as any,
      select: {
        id: true,
        fullName: true,
        email: true,
        university: true,
        whatsappPhone: true,
        role: true,
        campusId: true,
        suspendedAt: true,
        createdAt: true
      } as any
    }) as any;
  }

  async createAuditLog(payload: {
    actorId?: string | null;
    actorEmail?: string | null;
    action: string;
    targetType?: string | null;
    targetId?: string | null;
    campusId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: any;
  }) {
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        actorId: payload.actorId ?? null,
        actorEmail: payload.actorEmail ?? null,
        action: payload.action,
        targetType: payload.targetType ?? null,
        targetId: payload.targetId ?? null,
        campusId: payload.campusId ?? null,
        ip: payload.ip ?? null,
        userAgent: payload.userAgent ?? null,
        metadata: payload.metadata ?? null,
        createdAt: new Date()
      } as any
    });
  }

  async listAuditLogs(limit: number) {
    return prisma.auditLog.findMany({
      take: Math.min(Math.max(limit, 1), 200),
      orderBy: { createdAt: 'desc' } as any,
      select: {
        id: true,
        actorId: true,
        actorEmail: true,
        action: true,
        targetType: true,
        targetId: true,
        campusId: true,
        ip: true,
        userAgent: true,
        metadata: true,
        createdAt: true
      } as any
    }) as any;
  }
}
