import type { CreateItemRequestDto } from '../dto/item.dto';
import type { IItemRepository } from '../interfaces/item-repository.interface';
import { HttpError } from '../utils/http-error';
import { appMessages } from '../messages';
import type { UserRole } from '../types/user-role';

export class ItemService {
  constructor(private readonly itemRepository: IItemRepository) {}

  async findAll(request?: { userId?: string; campusId?: string | null }) {
    return this.itemRepository.findAll(request);
  }

  async findById(id: string, request?: { userId?: string; role?: UserRole; campusId?: string | null }) {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    if (request?.role === 'student' && item.ownerCampusId !== request.campusId) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    if (item.moderationStatus !== 'approved') {
      const canSee =
        Boolean(request?.userId && item.ownerId === request.userId) ||
        (request?.role && request.role !== 'student');
      if (!canSee) {
        throw new HttpError(404, appMessages.common.notFound);
      }
    }

    return item;
  }

  async create(payload: CreateItemRequestDto & { ownerId: string; ownerRole: UserRole }) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    const category = typeof payload.category === 'string' ? payload.category.trim() : '';
    const location = typeof payload.location === 'string' ? payload.location.trim() : '';
    const description = typeof payload.description === 'string' ? payload.description.trim() : '';
    const condition = typeof payload.condition === 'string' ? payload.condition.trim() : '';

    if (!category) {
      throw new HttpError(400, appMessages.items.categoryRequired);
    }

    if (!location) {
      throw new HttpError(400, appMessages.items.locationRequired);
    }

    const normalizedPhotos = Array.isArray(payload.photos)
      ? payload.photos.filter((p) => typeof p === 'string' && p.trim().length > 0)
      : [];

    if (normalizedPhotos.length === 0) {
      throw new HttpError(400, appMessages.items.photoRequired);
    }

    return this.itemRepository.create({
      ...payload,
      title: title || `${category} - ${payload.type}`,
      category,
      description,
      condition: condition || 'Non precise',
      location,
      photos: normalizedPhotos,
      moderationStatus: payload.ownerRole === 'student' ? 'pending' : 'approved',
      moderatedAt: null,
      moderatedById: null,
      moderationNote: null
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

  async registerView(itemId: string, request?: { viewerId?: string; role?: UserRole; campusId?: string | null }) {
    const item = await this.findById(itemId, {
      userId: request?.viewerId,
      role: request?.role,
      campusId: request?.campusId ?? null
    });

    return this.itemRepository.incrementViews(item.id, request?.viewerId, request?.campusId ?? null);
  }

  async toggleLike(itemId: string, request: { userId: string; role?: UserRole; campusId?: string | null }) {
    const item = await this.findById(itemId, {
      userId: request.userId,
      role: request.role,
      campusId: request.campusId ?? null
    });

    return this.itemRepository.toggleLike(item.id, request.userId, request.campusId ?? null);
  }

  async findLikesReceivedByOwnerId(ownerId: string, limit?: number) {
    return this.itemRepository.findLikesReceivedByOwnerId(ownerId, limit);
  }
}
