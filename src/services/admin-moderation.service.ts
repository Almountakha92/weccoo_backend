import { appMessages } from '../messages';
import type { PrismaAdminRepository } from '../repositories/prisma-admin.repository';
import { PrismaModerationRepository } from '../repositories/prisma-moderation.repository';
import { HttpError } from '../utils/http-error';

type ModerationStatus = 'pending' | 'approved' | 'rejected';

export class AdminModerationService {
  private readonly moderationRepository = new PrismaModerationRepository();

  constructor(private readonly adminRepository: PrismaAdminRepository) {}

  async listItems(params: {
    requester: { id: string; role: 'super_admin' | 'campus_admin'; campusId?: string | null };
    status?: string;
    studentId?: string;
    campusId?: string;
  }) {
    const status = params.status as ModerationStatus | undefined;
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      throw new HttpError(400, appMessages.common.invalidPayload);
    }

    if (params.requester.role === 'campus_admin') {
      if (!params.requester.campusId) {
        throw new HttpError(400, 'campusId manquant.');
      }

      if (params.campusId && params.campusId !== params.requester.campusId) {
        throw new HttpError(403, 'Acces interdit.');
      }

      if (params.studentId) {
        const target = await this.adminRepository.findUserForAdminAction(params.studentId);
        if (!target || target.role !== 'student') {
          throw new HttpError(404, appMessages.common.notFound);
        }
        if (target.campusId !== params.requester.campusId) {
          throw new HttpError(403, 'Acces interdit.');
        }
      }

      return this.moderationRepository.listItems({
        campusId: params.requester.campusId,
        studentId: params.studentId ?? null,
        status: status ?? null
      });
    }

    return this.moderationRepository.listItems({
      campusId: params.campusId ?? null,
      studentId: params.studentId ?? null,
      status: status ?? null
    });
  }

  async setModeration(params: {
    requester: { id: string; role: 'super_admin' | 'campus_admin'; campusId?: string | null; email?: string };
    itemId: string;
    status: ModerationStatus;
    note?: string;
  }) {
    const item = await this.moderationRepository.findItemOwnerCampus(params.itemId);
    if (!item) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    if (params.requester.role === 'campus_admin') {
      if (!params.requester.campusId || item.ownerCampusId !== params.requester.campusId) {
        throw new HttpError(403, 'Acces interdit.');
      }
    }

    const updated = await this.moderationRepository.setItemModeration({
      itemId: params.itemId,
      status: params.status,
      moderatorId: params.requester.id,
      note: params.note ?? null
    });

    await this.adminRepository.createAuditLog({
      actorId: params.requester.id,
      actorEmail: params.requester.email ?? null,
      action: params.status === 'approved' ? 'ITEM_APPROVED' : 'ITEM_REJECTED',
      targetType: 'item',
      targetId: params.itemId,
      campusId: item.ownerCampusId ?? null,
      metadata: params.note ? { note: params.note } : null
    });

    return updated;
  }

  async archiveItem(params: {
    requester: { id: string; role: 'super_admin' | 'campus_admin'; campusId?: string | null; email?: string };
    itemId: string;
  }) {
    const item = await this.moderationRepository.findItemOwnerCampus(params.itemId);
    if (!item) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    if ((item as any).archivedAt) {
      throw new HttpError(400, 'Publication deja archivee.');
    }

    if (params.requester.role === 'campus_admin') {
      if (!params.requester.campusId || item.ownerCampusId !== params.requester.campusId) {
        throw new HttpError(403, 'Acces interdit.');
      }
    }

    const archived = await this.moderationRepository.archiveItem(params.itemId);

    await this.adminRepository.createAuditLog({
      actorId: params.requester.id,
      actorEmail: params.requester.email ?? null,
      action: 'ITEM_ARCHIVED_BY_ADMIN',
      targetType: 'item',
      targetId: params.itemId,
      campusId: item.ownerCampusId ?? null
    });

    return archived;
  }
}
