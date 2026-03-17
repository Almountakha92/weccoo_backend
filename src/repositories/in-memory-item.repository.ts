import { itemsSeed } from '../data/seed';
import type { CreateItemEntityInput, IItemRepository } from '../interfaces/item-repository.interface';
import type { ItemEntity, ItemLikeReceivedEntity } from '../entities';

export class InMemoryItemRepository implements IItemRepository {
  private readonly items: ItemEntity[] = [...itemsSeed];
  private readonly likes = new Set<string>();

  async findAll(): Promise<ItemEntity[]> {
    return [...this.items]
      .filter((item) => !item.archivedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<ItemEntity | null> {
    const item = this.items.find((entry) => entry.id === id);
    return item ?? null;
  }

  async create(item: CreateItemEntityInput): Promise<ItemEntity> {
    const created: ItemEntity = {
      id: `it${this.items.length + 1}`,
      createdAt: new Date().toISOString(),
      archivedAt: null,
      likesCount: 0,
      viewsCount: 0,
      ...item
    };
    this.items.push(created);
    return created;
  }

  async archive(itemId: string): Promise<ItemEntity> {
    const item = this.items.find((entry) => entry.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }
    item.archivedAt = new Date().toISOString();
    return item;
  }

  async incrementViews(itemId: string): Promise<ItemEntity> {
    const item = this.items.find((entry) => entry.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }
    item.viewsCount = (item.viewsCount ?? 0) + 1;
    return item;
  }

  async toggleLike(itemId: string, userId: string): Promise<{ item: ItemEntity; liked: boolean }> {
    const item = this.items.find((entry) => entry.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    const key = `${userId}:${itemId}`;
    const alreadyLiked = this.likes.has(key);

    if (alreadyLiked) {
      this.likes.delete(key);
      item.likesCount = Math.max(0, (item.likesCount ?? 0) - 1);
      return { item, liked: false };
    }

    this.likes.add(key);
    item.likesCount = (item.likesCount ?? 0) + 1;
    return { item, liked: true };
  }

  async findLikesReceivedByOwnerId(_ownerId: string, _limit = 10): Promise<ItemLikeReceivedEntity[]> {
    return [];
  }
}
