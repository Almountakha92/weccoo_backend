export type ItemType = 'don' | 'echange' | 'pret';
export type ItemModerationStatus = 'pending' | 'approved' | 'rejected';

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
  moderationStatus: ItemModerationStatus;
  moderatedAt?: string | null;
  moderatedById?: string | null;
  moderationNote?: string | null;
  photos?: string[];
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  archivedAt?: string | null;
}
