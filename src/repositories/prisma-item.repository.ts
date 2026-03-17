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
  photos: Array.isArray(item.photos) ? item.photos : [],
  likesCount: item.likesCount ?? 0,
  viewsCount: item.viewsCount ?? 0,
  createdAt: item.createdAt.toISOString(),
  archivedAt: item.archivedAt ? item.archivedAt.toISOString() : null
});

export class PrismaItemRepository implements IItemRepository {
  private readonly prismaAny = prisma as any;

  async findAll(): Promise<ItemEntity[]> {
    const items = await this.prismaAny.item.findMany({
      where: { archivedAt: null } as any,
      include: {
        owner: {
          select: {
            fullName: true,
            whatsappPhone: true
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
            whatsappPhone: true
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
            whatsappPhone: true
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
        photos: Array.isArray((item as any).photos) ? (item as any).photos : [],
        likesCount: 0,
        viewsCount: 0
      } as any,
      include: {
        owner: {
          select: {
            fullName: true,
            whatsappPhone: true
          } as any
        }
      }
    });

    return toItemEntity(created as any);
  }

  async incrementViews(itemId: string): Promise<ItemEntity> {
    const updated = await this.prismaAny.item.update({
      where: { id: itemId },
      data: {
        viewsCount: { increment: 1 }
      } as any,
      include: {
        owner: {
          select: {
            fullName: true,
            whatsappPhone: true
          } as any
        }
      }
    });

    return toItemEntity(updated as any);
  }

  async toggleLike(itemId: string, userId: string): Promise<{ item: ItemEntity; liked: boolean }> {
    const existing = await this.prismaAny.itemLike.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    });

    if (existing) {
      await this.prismaAny.itemLike.delete({ where: { id: existing.id } });
      const updated = await this.prismaAny.item.update({
        where: { id: itemId },
        data: { likesCount: { decrement: 1 } } as any,
        include: {
          owner: {
            select: {
              fullName: true,
              whatsappPhone: true
            } as any
          }
        }
      });
      return { item: toItemEntity(updated as any), liked: false };
    }

    await this.prismaAny.itemLike.create({
      data: {
        id: randomUUID(),
        userId,
        itemId,
        createdAt: new Date()
      } as any
    });

    const updated = await this.prismaAny.item.update({
      where: { id: itemId },
      data: { likesCount: { increment: 1 } } as any,
      include: {
        owner: {
          select: {
            fullName: true,
            whatsappPhone: true
          } as any
        }
      }
    });

    return { item: toItemEntity(updated as any), liked: true };
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
