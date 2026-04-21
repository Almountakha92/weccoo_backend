import { prisma } from '../config/prisma';
import type { UserRole } from '../types/user-role';

export class StatsService {
  async getStats(request?: { role?: UserRole; campusId?: string | null }) {
    const scope = request?.campusId && request.role === 'student' ? 'campus' : 'global';
    const itemWhere =
      scope === 'campus'
        ? {
            archivedAt: null,
            moderationStatus: 'approved' as const,
            owner: { campusId: request?.campusId ?? null }
          }
        : {
            archivedAt: null,
            moderationStatus: 'approved' as const
          };
    const userWhere =
      scope === 'campus'
        ? {
            campusId: request?.campusId ?? null,
            role: 'student' as const
          }
        : {
            role: 'student' as const
          };

    const [itemsCount, usersCount, itemAggregates] = await Promise.all([
      prisma.item.count({ where: itemWhere }),
      prisma.user.count({ where: userWhere }),
      prisma.item.aggregate({
        where: itemWhere,
        _sum: {
          likesCount: true,
          viewsCount: true
        }
      })
    ]);

    return {
      itemsCount,
      usersCount,
      totalLikesCount: itemAggregates._sum.likesCount ?? 0,
      totalViewsCount: itemAggregates._sum.viewsCount ?? 0,
      scope
    };
  }
}
