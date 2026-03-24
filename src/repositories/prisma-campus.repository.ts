import { prisma } from '../config/prisma';

export class PrismaCampusRepository {
  async list() {
    return (await prisma.campus.findMany({
      orderBy: { createdAt: 'desc' } as any,
      select: { id: true, name: true, createdAt: true } as any
    })) as any;
  }

  async exists(campusId: string): Promise<boolean> {
    const found = await prisma.campus.findUnique({
      where: { id: campusId },
      select: { id: true } as any
    });
    return Boolean(found);
  }
}

