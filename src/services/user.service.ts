import type { UpdateMeRequestDto } from '../dto/user.dto';
import { appMessages } from '../messages';
import { HttpError } from '../utils/http-error';
import { hashPassword, verifyPassword } from '../utils/password';
import type { PrismaUserRepository } from '../repositories/prisma-user.repository';

const normalizePhone = (value: string) => value.trim();

export class UserService {
  constructor(private readonly userRepository: PrismaUserRepository) {}

  async updateMe(userId: string, payload: UpdateMeRequestDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, appMessages.common.notFound);
    }

    const data: { whatsappPhone?: string; password?: string } = {};

    if (typeof payload.whatsappPhone === 'string') {
      const phone = normalizePhone(payload.whatsappPhone);
      if (!/^\+?[0-9]{8,15}$/.test(phone)) {
        throw new HttpError(400, 'Numero WhatsApp invalide.');
      }
      data.whatsappPhone = phone;
    }

    if (typeof payload.newPassword === 'string') {
      const currentPassword = payload.currentPassword ?? '';
      if (!currentPassword.trim()) {
        throw new HttpError(400, 'Mot de passe actuel requis.');
      }

      if (!verifyPassword(currentPassword, user.password)) {
        throw new HttpError(401, 'Mot de passe actuel incorrect.');
      }

      const newPassword = payload.newPassword;
      if (newPassword.length < 8) {
        throw new HttpError(400, 'Le mot de passe doit contenir au moins 8 caracteres.');
      }

      data.password = hashPassword(newPassword);
    }

    if (Object.keys(data).length === 0) {
      throw new HttpError(400, appMessages.common.invalidPayload);
    }

    const updated = await this.userRepository.update(userId, data);
    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      university: updated.university,
      whatsappPhone: updated.whatsappPhone ?? ''
    };
  }
}

