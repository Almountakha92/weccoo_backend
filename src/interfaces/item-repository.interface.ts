import type { ItemEntity } from '../entities';
import type { ItemLikeReceivedEntity } from '../entities';

export type CreateItemEntityInput = Omit<
  ItemEntity,
  | 'id'
  | 'createdAt'
  | 'ownerName'
  | 'ownerInitials'
  | 'ownerWhatsappPhone'
  | 'likesCount'
  | 'viewsCount'
>;

export interface IItemRepository {
  findAll(): Promise<ItemEntity[]>;
  findById(id: string): Promise<ItemEntity | null>;
  create(item: CreateItemEntityInput): Promise<ItemEntity>;
  incrementViews(itemId: string): Promise<ItemEntity>;
  toggleLike(itemId: string, userId: string): Promise<{ item: ItemEntity; liked: boolean }>;
  findLikesReceivedByOwnerId(ownerId: string, limit?: number): Promise<ItemLikeReceivedEntity[]>;
}
