import type { ItemType } from '../entities';

export interface CreateItemRequestDto {
  title: string;
  category: string;
  description: string;
  condition: string;
  type: ItemType;
  location: string;
  photos?: string[];
}

export interface ItemResponseDto {
  id: string;
  title: string;
  category: string;
  description: string;
  condition: string;
  type: ItemType;
  location: string;
  ownerId: string;
  ownerName?: string;
  ownerInitials?: string;
  ownerWhatsappPhone?: string;
  photos: string[];
  likesCount: number;
  viewsCount: number;
  createdAt: string;
}
