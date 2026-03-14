import type { UserEntity } from '../entities';

export interface IAuthRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: Omit<UserEntity, 'id' | 'createdAt'>): Promise<UserEntity>;
}
