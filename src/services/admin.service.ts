import type { CreateCampusAdminRequestDto, CreateCampusRequestDto } from '../dto/admin.dto';
import { appMessages } from '../messages';
import type { PrismaAdminRepository } from '../repositories/prisma-admin.repository';
import { HttpError } from '../utils/http-error';
import { hashPassword } from '../utils/password';

export class AdminService {
  constructor(private readonly adminRepository: PrismaAdminRepository) {}

  async createCampus(actor: { id: string; email: string }, payload: CreateCampusRequestDto, context?: { ip?: string; userAgent?: string }) {
    const name = payload.name?.trim();
    if (!name) {
      throw new HttpError(400, appMessages.common.invalidPayload);
    }

    const campus = await this.adminRepository.createCampus(name);
    await this.adminRepository.createAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'CAMPUS_CREATED',
      targetType: 'campus',
      targetId: campus.id,
      campusId: campus.id,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null,
      metadata: { name }
    });

    return campus;
  }

  async listCampuses() {
    return this.adminRepository.listCampuses();
  }

  async createCampusAdmin(
    actor: { id: string; email: string },
    payload: CreateCampusAdminRequestDto,
    context?: { ip?: string; userAgent?: string }
  ) {
    const email = payload.email?.trim().toLowerCase();
    const fullName = payload.fullName?.trim();
    const university = payload.university?.trim();
    const campusId = payload.campusId?.trim();
    const password = payload.password ?? '';

    if (!email || !fullName || !university || !campusId || password.length < 8) {
      throw new HttpError(400, appMessages.common.invalidPayload);
    }

    const created = await this.adminRepository.createCampusAdmin({
      fullName,
      university,
      email,
      whatsappPhone: payload.whatsappPhone?.trim() || null,
      password: hashPassword(password),
      campusId
    });

    await this.adminRepository.createAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'CAMPUS_ADMIN_CREATED',
      targetType: 'user',
      targetId: created.id,
      campusId,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null,
      metadata: { email }
    });

    return created;
  }

  async listCampusAdmins() {
    return this.adminRepository.listCampusAdmins();
  }

  async suspendCampusAdmin(
    actor: { id: string; email: string },
    campusAdminId: string,
    suspended: boolean,
    context?: { ip?: string; userAgent?: string }
  ) {
    const updated = await this.adminRepository.setUserSuspended(campusAdminId, suspended);
    await this.adminRepository.createAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: suspended ? 'CAMPUS_ADMIN_SUSPENDED' : 'CAMPUS_ADMIN_RESUMED',
      targetType: 'user',
      targetId: campusAdminId,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null
    });
    return updated;
  }

  async setUserCampus(
    actor: { id: string; email: string },
    userId: string,
    campusId: string | null,
    context?: { ip?: string; userAgent?: string }
  ) {
    const updated = await this.adminRepository.setUserCampus(userId, campusId);
    await this.adminRepository.createAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'USER_CAMPUS_UPDATED',
      targetType: 'user',
      targetId: userId,
      campusId: campusId ?? null,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null
    });
    return updated;
  }

  async listStudentsByCampus(requestingUser: { role: 'campus_admin' | 'super_admin'; campusId: string | null }, campusId?: string) {
    const effectiveCampusId =
      requestingUser.role === 'campus_admin' ? requestingUser.campusId : (campusId ?? null);

    if (!effectiveCampusId) {
      throw new HttpError(400, 'campusId requis.');
    }

    return this.adminRepository.listStudentsByCampus(effectiveCampusId);
  }

  async suspendStudent(
    actor: { id: string; email: string; role: 'campus_admin' | 'super_admin'; campusId: string | null },
    studentId: string,
    suspended: boolean,
    context?: { ip?: string; userAgent?: string }
  ) {
    const target = await this.adminRepository.findUserForAdminAction(studentId);
    if (!target) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    if (target.role !== 'student') {
      throw new HttpError(400, 'Cible invalide (student requis).');
    }

    if (actor.role === 'campus_admin') {
      if (!actor.campusId || target.campusId !== actor.campusId) {
        throw new HttpError(403, 'Acces interdit.');
      }
    }

    const updated = await this.adminRepository.setUserSuspended(studentId, suspended);
    await this.adminRepository.createAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: suspended ? 'STUDENT_SUSPENDED' : 'STUDENT_RESUMED',
      targetType: 'user',
      targetId: studentId,
      campusId: (target as any).campusId ?? null,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null
    });
    return updated;
  }

  async deleteStudent(
    actor: { id: string; email: string },
    studentId: string,
    context?: { ip?: string; userAgent?: string }
  ) {
    const target = await this.adminRepository.findUserForAdminAction(studentId);
    if (!target) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    if (target.role !== 'student') {
      throw new HttpError(400, 'Cible invalide (student requis).');
    }

    await this.adminRepository.deleteUser(studentId);
    await this.adminRepository.createAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'STUDENT_DELETED',
      targetType: 'user',
      targetId: studentId,
      campusId: (target as any).campusId ?? null,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null
    });

    return { ok: true };
  }

  async resetCampusAdminMfa(
    actor: { id: string; email: string },
    campusAdminId: string,
    context?: { ip?: string; userAgent?: string }
  ) {
    await this.adminRepository.clearMfa(campusAdminId);
    await this.adminRepository.createAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'CAMPUS_ADMIN_MFA_RESET',
      targetType: 'user',
      targetId: campusAdminId,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null
    });
    return { ok: true };
  }

  async listUsersByCampus(requestingUser: { role: 'campus_admin' | 'super_admin'; campusId: string | null }, campusId?: string) {
    const effectiveCampusId =
      requestingUser.role === 'campus_admin' ? requestingUser.campusId : (campusId ?? null);

    if (!effectiveCampusId) {
      throw new HttpError(400, 'campusId requis.');
    }

    return this.adminRepository.listUsersByCampus(effectiveCampusId);
  }

  async listAuditLogs(limit: number) {
    return this.adminRepository.listAuditLogs(limit);
  }
}
