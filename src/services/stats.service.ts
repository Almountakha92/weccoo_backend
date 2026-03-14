import { prisma } from '../config/prisma';

export class StatsService {
  async getStats() {
    const [itemsCount, usersCount] = await Promise.all([
      prisma.item.count(),
      prisma.user.count()
    ]);

    return {
      itemsCount,
      usersCount
    };
  }
}

