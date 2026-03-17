export type ItemType = 'don' | 'echange' | 'pret';

export interface ItemEntity {
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
  photos?: string[];
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  archivedAt?: string | null;
}
