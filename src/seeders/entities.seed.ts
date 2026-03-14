import type { ConversationEntity, ItemEntity, MessageEntity, UserEntity } from '../entities';
import { hashPassword } from '../utils/password';

const now = new Date().toISOString();
const placeholderPhoto =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3Z4iQAAAAASUVORK5CYII=';

export const usersSeed: UserEntity[] = [
  {
    id: 'u1',
    fullName: 'Baye Leyty',
    university: 'Université Cheikh Anta Diop',
    email: 'baye@ucad.sn',
    whatsappPhone: '221771234567',
    password: hashPassword('password123'),
    createdAt: now
  },
  {
    id: 'u2',
    fullName: 'Julie Lambert',
    university: 'Sorbonne Université',
    email: 'julie@sorbonne.fr',
    whatsappPhone: '33612345678',
    password: hashPassword('password123'),
    createdAt: now
  }
];

export const itemsSeed: ItemEntity[] = [
  {
    id: 'it1',
    title: 'Physique Quantique — 3eme edition',
    category: 'Livre',
    description: 'Manuel en tres bon etat.',
    condition: 'Tres bon etat',
    type: 'don',
    location: 'Paris 14e',
    ownerId: 'u2',
    photos: [placeholderPhoto],
    likesCount: 0,
    viewsCount: 0,
    createdAt: now
  }
];

export const conversationsSeed: ConversationEntity[] = [
  {
    id: 'c1',
    participantIds: ['u1', 'u2'],
    itemId: 'it1',
    createdAt: now
  }
];

export const messagesSeed: MessageEntity[] = [
  {
    id: 'm1',
    conversationId: 'c1',
    senderId: 'u2',
    text: 'Salut, le livre est toujours disponible.',
    sentAt: now
  }
];
