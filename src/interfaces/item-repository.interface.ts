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
  findAll(request?: { userId?: string; campusId?: string | null }): Promise<ItemEntity[]>;
  findById(id: string): Promise<ItemEntity | null>;
  create(item: CreateItemEntityInput): Promise<ItemEntity>;
  archive(itemId: string): Promise<ItemEntity>;
  incrementViews(itemId: string, viewerId?: string, viewerCampusId?: string | null): Promise<ItemEntity>;
  toggleLike(itemId: string, userId: string, userCampusId?: string | null): Promise<{ item: ItemEntity; liked: boolean }>;
  findLikesReceivedByOwnerId(ownerId: string, limit?: number): Promise<ItemLikeReceivedEntity[]>;
}
