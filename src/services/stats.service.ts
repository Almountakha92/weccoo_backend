import { prisma } from '../config/prisma';

export class StatsService {
  async getStats() {
    const [itemsCount, usersCount, itemAggregates] = await Promise.all([
      prisma.item.count({
        where: { archivedAt: null, moderationStatus: 'approved' }
      }),
      prisma.user.count(),
      prisma.item.aggregate({
        where: { archivedAt: null, moderationStatus: 'approved' },
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
      totalViewsCount: itemAggregates._sum.viewsCount ?? 0
    };
  }
}
