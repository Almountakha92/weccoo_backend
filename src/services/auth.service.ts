import type { LoginRequestDto, SignupRequestDto } from '../dto/auth.dto';
import type { IAuthRepository } from '../interfaces/auth-repository.interface';
import { appMessages } from '../messages';
import { signAuthToken } from '../utils/token';
import { HttpError } from '../utils/http-error';
import { hashPassword, verifyPassword } from '../utils/password';
import { PrismaCampusRepository } from '../repositories/prisma-campus.repository';

export class AuthService {
  private readonly campusRepository = new PrismaCampusRepository();

  constructor(private readonly authRepository: IAuthRepository) {}

  async signup(payload: SignupRequestDto) {
    const existing = await this.authRepository.findByEmail(payload.email);
    if (existing) {
      throw new HttpError(409, appMessages.auth.emailAlreadyUsed);
    }

    const campusId = payload.campusId?.trim();
    if (!campusId) {
      throw new HttpError(400, 'Campus requis.');
    }

    const campusExists = await this.campusRepository.exists(campusId);
    if (!campusExists) {
      throw new HttpError(400, 'Campus invalide.');
    }

    const user = await this.authRepository.create({
      fullName: payload.fullName,
      university: payload.university,
      email: payload.email,
      whatsappPhone: payload.whatsappPhone,
      password: hashPassword(payload.password),
      role: 'student',
      campusId
    });

    return {
      token: signAuthToken({
        sub: user.id,
        email: user.email,
        role: user.role ?? 'student',
        campusId: user.campusId ?? null,
        mfa: false
      }),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        whatsappPhone: user.whatsappPhone,
        campusId: user.campusId ?? null
      }
    };
  }

  async login(payload: LoginRequestDto) {
    const user = await this.authRepository.findByEmail(payload.email);

    if (!user || !verifyPassword(payload.password, user.password)) {
      throw new HttpError(401, appMessages.auth.invalidCredentials);
    }

    if (user.suspendedAt) {
      throw new HttpError(403, 'Compte suspendu.');
    }

    return {
      token: signAuthToken({
        sub: user.id,
        email: user.email,
        role: user.role ?? 'student',
        campusId: user.campusId ?? null,
        mfa: false
      }),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        whatsappPhone: user.whatsappPhone,
        campusId: user.campusId ?? null
      }
    };
  }
}
