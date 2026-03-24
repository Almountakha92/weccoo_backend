import { prisma } from '../config/prisma';

type ModerationStatus = 'pending' | 'approved' | 'rejected';

export class PrismaModerationRepository {
  private readonly prismaAny = prisma as any;

  async listItems(params: { campusId?: string | null; studentId?: string | null; status?: ModerationStatus | null }) {
    const where: any = { archivedAt: null };

    if (params.status) {
      where.moderationStatus = params.status;
    }

    if (params.studentId) {
      where.ownerId = params.studentId;
    }

    if (params.campusId) {
      where.owner = { campusId: params.campusId };
    }

    const items = await this.prismaAny.item.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            campusId: true
          } as any
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return items.map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      condition: item.condition,
      type: item.type,
      location: item.location,
      photos: Array.isArray(item.photos) ? item.photos : [],
      ownerId: item.ownerId,
      ownerName: item.owner?.fullName ?? null,
      ownerEmail: item.owner?.email ?? null,
      campusId: item.owner?.campusId ?? null,
      moderationStatus: item.moderationStatus ?? 'approved',
      moderatedAt: item.moderatedAt ? item.moderatedAt.toISOString() : null,
      moderationNote: item.moderationNote ?? null,
      createdAt: item.createdAt.toISOString()
    }));
  }

  async setItemModeration(params: {
    itemId: string;
    status: ModerationStatus;
    moderatorId: string;
    note?: string | null;
  }) {
    return this.prismaAny.item.update({
      where: { id: params.itemId },
      data: {
        moderationStatus: params.status,
        moderatedAt: new Date(),
        moderatedById: params.moderatorId,
        moderationNote: params.note ?? null
      } as any,
      select: { id: true, moderationStatus: true, moderatedAt: true, moderatedById: true, moderationNote: true, ownerId: true } as any
    }) as any;
  }

  async archiveItem(itemId: string) {
    return this.prismaAny.item.update({
      where: { id: itemId },
      data: { archivedAt: new Date() } as any,
      select: { id: true, archivedAt: true, ownerId: true } as any
    }) as any;
  }

  async findItemOwnerCampus(itemId: string): Promise<{ id: string; ownerId: string; ownerCampusId: string | null } | null> {
    const item = await this.prismaAny.item.findUnique({
      where: { id: itemId },
      select: { id: true, ownerId: true, archivedAt: true, owner: { select: { campusId: true } as any } } as any
    });

    if (!item) return null;

    return {
      id: item.id,
      ownerId: item.ownerId,
      ownerCampusId: item.owner?.campusId ?? null,
      archivedAt: item.archivedAt ? item.archivedAt.toISOString() : null
    } as any;
  }
}
