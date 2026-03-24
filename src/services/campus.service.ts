import type { PrismaCampusRepository } from '../repositories/prisma-campus.repository';

export class CampusService {
  constructor(private readonly campusRepository: PrismaCampusRepository) {}

  listCampuses() {
    return this.campusRepository.list();
  }

  campusExists(campusId: string) {
    return this.campusRepository.exists(campusId);
  }
}

