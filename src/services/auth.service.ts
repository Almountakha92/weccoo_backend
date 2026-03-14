import type { LoginRequestDto, SignupRequestDto } from '../dto/auth.dto';
import type { IAuthRepository } from '../interfaces/auth-repository.interface';
import { appMessages } from '../messages';
import { signAuthToken } from '../utils/token';
import { HttpError } from '../utils/http-error';
import { hashPassword, verifyPassword } from '../utils/password';

export class AuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async signup(payload: SignupRequestDto) {
    const existing = await this.authRepository.findByEmail(payload.email);
    if (existing) {
      throw new HttpError(409, appMessages.auth.emailAlreadyUsed);
    }

    const user = await this.authRepository.create({
      fullName: payload.fullName,
      university: payload.university,
      email: payload.email,
      whatsappPhone: payload.whatsappPhone,
      password: hashPassword(payload.password)
    });

    return {
      token: signAuthToken({ sub: user.id, email: user.email }),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        whatsappPhone: user.whatsappPhone
      }
    };
  }

  async login(payload: LoginRequestDto) {
    const user = await this.authRepository.findByEmail(payload.email);

    if (!user || !verifyPassword(payload.password, user.password)) {
      throw new HttpError(401, appMessages.auth.invalidCredentials);
    }

    return {
      token: signAuthToken({ sub: user.id, email: user.email }),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        whatsappPhone: user.whatsappPhone
      }
    };
  }
}
