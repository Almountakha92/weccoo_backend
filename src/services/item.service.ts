import type { CreateItemRequestDto } from '../dto/item.dto';
import type { IItemRepository } from '../interfaces/item-repository.interface';
import { HttpError } from '../utils/http-error';
import { appMessages } from '../messages';

export class ItemService {
  constructor(private readonly itemRepository: IItemRepository) {}

  async findAll() {
    return this.itemRepository.findAll();
  }

  async findById(id: string) {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new HttpError(404, appMessages.common.notFound);
    }
    return item;
  }

  async create(payload: CreateItemRequestDto & { ownerId: string }) {
    const normalizedPhotos = Array.isArray(payload.photos)
      ? payload.photos.filter((p) => typeof p === 'string' && p.trim().length > 0)
      : [];

    if (normalizedPhotos.length === 0) {
      throw new HttpError(400, appMessages.items.photoRequired);
    }

    return this.itemRepository.create({
      ...payload,
      photos: normalizedPhotos
    });
  }

  async archive(itemId: string, ownerId: string) {
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new HttpError(404, appMessages.common.notFound);
    }
    if (item.ownerId !== ownerId) {
      throw new HttpError(403, appMessages.common.unauthorized);
    }

    return this.itemRepository.archive(itemId);
  }

  async registerView(itemId: string) {
    return this.itemRepository.incrementViews(itemId);
  }

  async toggleLike(itemId: string, userId: string) {
    return this.itemRepository.toggleLike(itemId, userId);
  }

  async findLikesReceivedByOwnerId(ownerId: string, limit?: number) {
    return this.itemRepository.findLikesReceivedByOwnerId(ownerId, limit);
  }
}
