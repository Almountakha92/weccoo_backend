import { randomUUID } from 'crypto';
import type { ItemEntity, ItemLikeReceivedEntity } from '../entities';
import type { CreateItemEntityInput, IItemRepository } from '../interfaces/item-repository.interface';
import { prisma } from '../config/prisma';

const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
};

const toItemEntity = (item: any): ItemEntity => ({
  id: item.id,
  title: item.title,
  category: item.category,
  description: item.description,
  condition: item.condition,
  type: item.type,
  location: item.location,
  ownerId: item.ownerId,
  ownerName: item.owner?.fullName,
  ownerInitials: item.owner?.fullName ? getInitials(item.owner.fullName) : undefined,
  ownerWhatsappPhone: item.owner?.whatsappPhone,
  ownerCampusId: item.owner?.campusId,
  photos: Array.isArray(item.photos) ? item.photos : [],
  moderationStatus: item.moderationStatus ?? 'approved',
  moderatedAt: item.moderatedAt ? item.moderatedAt.toISOString() : null,
  moderatedById: item.moderatedById ?? null,
  moderationNote: item.moderationNote ?? null,
  likesCount: item.likesCount ?? 0,
  viewsCount: item.viewsCount ?? 0,
  createdAt: item.createdAt.toISOString(),
  archivedAt: item.archivedAt ? item.archivedAt.toISOString() : null
});

export class PrismaItemRepository implements IItemRepository {
  private readonly prismaAny = prisma as any;

  async findAll(request?: { userId?: string; campusId?: string | null; includeOwn?: boolean }): Promise<ItemEntity[]> {
    const where: any = {
      archivedAt: null,
    };

    if (request?.campusId) {
      where.owner = {
        campusId: request.campusId
      };
    }

    if (request?.userId) {
      where.OR = [
        { moderationStatus: 'approved' },
        { ownerId: request.userId }
      ];
    } else {
      where.moderationStatus = 'approved';
    }

    const items = await this.prismaAny.item.findMany({
      where,
      include: {
        owner: {
          select: {
            fullName: true,
            whatsappPhone: true,
            campusId: true
          } as any
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return items.map((item: any) => toItemEntity(item as any));
  }

  async findById(id: string): Promise<ItemEntity | null> {
    const item = await this.prismaAny.item.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            fullName: true,
            whatsappPhone: true,
            campusId: true
          } as any
        }
      }
    });

    return item ? toItemEntity(item as any) : null;
  }

  async archive(itemId: string): Promise<ItemEntity> {
    const archived = await this.prismaAny.item.update({
      where: { id: itemId },
      data: { archivedAt: new Date() } as any,
      include: {
        owner: {
          select: {
            fullName: true,
            whatsappPhone: true,
            campusId: true
          } as any
        }
      }
    });

    return toItemEntity(archived as any);
  }

  async create(item: CreateItemEntityInput): Promise<ItemEntity> {
    const created = await this.prismaAny.item.create({
      data: {
        id: randomUUID(),
        title: item.title,
        category: item.category,
        description: item.description,
        condition: item.condition,
        type: item.type,
        location: item.location,
        ownerId: item.ownerId,
        createdAt: new Date(),
        archivedAt: null,
        moderationStatus: (item as any).moderationStatus ?? 'approved',
        moderatedAt: (item as any).moderatedAt ?? null,
        moderatedById: (item as any).moderatedById ?? null,
        moderationNote: (item as any).moderationNote ?? null,
        photos: Array.isArray((item as any).photos) ? (item as any).photos : [],
        likesCount: 0,
        viewsCount: 0
      } as any,
      include: {
        owner: {
          select: {
            fullName: true,
            whatsappPhone: true,
            campusId: true
          } as any
        }
      }
    });

    return toItemEntity(created as any);
  }

  async incrementViews(itemId: string, viewerId?: string, viewerCampusId?: string | null): Promise<ItemEntity> {
    const result = await this.prismaAny.$transaction(async (tx: any) => {
      const item = await tx.item.findUnique({
        where: { id: itemId },
        include: {
          owner: {
            select: {
              fullName: true,
              whatsappPhone: true,
              campusId: true
            } as any
          }
        }
      });

      if (!item) {
        throw new Error('Item not found');
      }

      if (!viewerId || item.ownerId === viewerId) {
        return item;
      }

      if (viewerCampusId && item.owner?.campusId && item.owner.campusId !== viewerCampusId) {
        throw new Error('Item not found');
      }

      const existingView = await tx.itemView.findUnique({
        where: {
          userId_itemId: {
            userId: viewerId,
            itemId
          }
        }
      });

      if (existingView) {
        return item;
      }

      await tx.itemView.create({
        data: {
          id: randomUUID(),
          userId: viewerId,
          itemId,
          createdAt: new Date()
        } as any
      });

      return tx.item.update({
        where: { id: itemId },
        data: {
          viewsCount: { increment: 1 }
        } as any,
        include: {
          owner: {
            select: {
              fullName: true,
              whatsappPhone: true,
              campusId: true
            } as any
          }
        }
      });
    });

    return toItemEntity(result as any);
  }

  async toggleLike(itemId: string, userId: string, userCampusId?: string | null): Promise<{ item: ItemEntity; liked: boolean }> {
    return this.prismaAny.$transaction(async (tx: any) => {
      const item = await tx.item.findUnique({
        where: { id: itemId },
        include: {
          owner: {
            select: {
              fullName: true,
              whatsappPhone: true,
              campusId: true
            } as any
          }
        }
      });

      if (!item) {
        throw new Error('Item not found');
      }

      if (userCampusId && item.owner?.campusId && item.owner.campusId !== userCampusId) {
        throw new Error('Item not found');
      }

      const existing = await tx.itemLike.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        }
      });

      if (existing) {
        await tx.itemLike.delete({ where: { id: existing.id } });
        const updated = await tx.item.update({
          where: { id: itemId },
          data: { likesCount: { decrement: 1 } } as any,
          include: {
            owner: {
              select: {
                fullName: true,
                whatsappPhone: true,
                campusId: true
              } as any
            }
          }
        });
        return { item: toItemEntity(updated as any), liked: false };
      }

      await tx.itemLike.create({
        data: {
          id: randomUUID(),
          userId,
          itemId,
          createdAt: new Date()
        } as any
      });

      const updated = await tx.item.update({
        where: { id: itemId },
        data: { likesCount: { increment: 1 } } as any,
        include: {
          owner: {
            select: {
              fullName: true,
              whatsappPhone: true,
              campusId: true
            } as any
          }
        }
      });

      return { item: toItemEntity(updated as any), liked: true };
    });
  }

  async findLikesReceivedByOwnerId(ownerId: string, limit = 10): Promise<ItemLikeReceivedEntity[]> {
    const likes = await this.prismaAny.itemLike.findMany({
      where: {
        item: {
          ownerId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          } as any
        },
        item: {
          select: {
            id: true,
            title: true,
            type: true
          } as any
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.max(0, Math.min(Number(limit) || 10, 50))
    });

    return likes.map((like: any) => ({
      id: like.id,
      createdAt: like.createdAt.toISOString(),
      item: {
        id: like.item.id,
        title: like.item.title,
        type: like.item.type
      },
      liker: {
        id: like.user.id,
        fullName: like.user.fullName,
        initials: getInitials(like.user.fullName)
      }
    }));
  }
}
