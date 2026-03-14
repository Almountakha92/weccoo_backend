import { usersSeed } from '../data/seed';
import type { IAuthRepository } from '../interfaces/auth-repository.interface';
import type { UserEntity } from '../entities';

export class InMemoryAuthRepository implements IAuthRepository {
  private readonly users: UserEntity[] = [...usersSeed];

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ?? null;
  }

  async create(user: Omit<UserEntity, 'id' | 'createdAt'>): Promise<UserEntity> {
    const created: UserEntity = {
      id: `u${this.users.length + 1}`,
      createdAt: new Date().toISOString(),
      ...user
    };
    this.users.push(created);
    return created;
  }
}
