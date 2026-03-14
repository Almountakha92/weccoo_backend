import type { ItemType } from './item.entity';

export interface ItemLikeReceivedEntity {
  id: string;
  createdAt: string;
  item: {
    id: string;
    title: string;
    type: ItemType;
  };
  liker: {
    id: string;
    fullName: string;
    initials: string;
  };
}

