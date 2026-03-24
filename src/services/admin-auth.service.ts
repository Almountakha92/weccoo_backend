import type { AdminLoginRequestDto, AdminLoginResponseDto, AdminMfaConfirmRequestDto } from '../dto/admin-auth.dto';
import { appMessages } from '../messages';
import { PrismaAdminRepository } from '../repositories/prisma-admin.repository';
import { HttpError } from '../utils/http-error';
import { verifyPassword } from '../utils/password';
import { signAuthToken, signPreAuthToken, verifyAuthToken } from '../utils/token';
import { buildOtpAuthUrl, generateTotpSecret, verifyTotpCode } from '../utils/totp';
import { env } from '../config/env';

export class AdminAuthService {
  constructor(private readonly adminRepository: PrismaAdminRepository) {}

  async login(payload: AdminLoginRequestDto, context?: { ip?: string; userAgent?: string }): Promise<AdminLoginResponseDto> {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password ?? '';

    const user = await this.adminRepository.findAuthUserByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      throw new HttpError(401, appMessages.auth.invalidCredentials);
    }

    if (user.role === 'student') {
      throw new HttpError(403, 'Compte non admin.');
    }

    if (user.suspendedAt) {
      throw new HttpError(403, 'Compte admin suspendu.');
    }

    if (!env.adminMfaRequired) {
      const token = signAuthToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        campusId: user.campusId,
        mfa: true
      });

      await this.adminRepository.createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'ADMIN_LOGIN',
        campusId: user.campusId,
        ip: context?.ip ?? null,
        userAgent: context?.userAgent ?? null,
        metadata: { mfaRequired: false }
      });

      return { token, mfaSetupRequired: false };
    }

    if (user.mfaEnabled) {
      const otp = payload.otp?.trim() ?? '';
      if (!otp) {
        throw new HttpError(401, 'OTP requis.');
      }

      if (!user.mfaSecret || !verifyTotpCode({ secret: user.mfaSecret, code: otp })) {
        throw new HttpError(401, 'OTP invalide.');
      }

      const token = signAuthToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        campusId: user.campusId,
        mfa: true
      });

      await this.adminRepository.createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'ADMIN_LOGIN',
        campusId: user.campusId,
        ip: context?.ip ?? null,
        userAgent: context?.userAgent ?? null
      });

      return { token, mfaSetupRequired: false };
    }

    const secret = generateTotpSecret();
    await this.adminRepository.setMfaTempSecret(user.id, secret);

    const preAuthToken = signPreAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      campusId: user.campusId
    });

    return {
      mfaSetupRequired: true,
      preAuthToken,
      secret,
      otpauthUrl: buildOtpAuthUrl({ issuer: 'WECCOO', accountName: user.email, secret })
    };
  }

  async confirmMfa(payload: AdminMfaConfirmRequestDto, context?: { ip?: string; userAgent?: string }) {
    const tokenPayload = verifyAuthToken(payload.preAuthToken);
    if (tokenPayload.typ !== 'preauth') {
      throw new HttpError(401, appMessages.common.unauthorized);
    }

    const user = await this.adminRepository.findAuthUserById(tokenPayload.sub);
    if (!user || user.role === 'student') {
      throw new HttpError(401, appMessages.common.unauthorized);
    }

    if (!user.mfaTempSecret) {
      throw new HttpError(400, 'Aucun secret MFA en attente.');
    }

    const otp = payload.otp?.trim() ?? '';
    if (!verifyTotpCode({ secret: user.mfaTempSecret, code: otp })) {
      throw new HttpError(401, 'OTP invalide.');
    }

    const enabledSecret = await this.adminRepository.enableMfaFromTempSecret(user.id);
    if (!enabledSecret) {
      throw new HttpError(400, 'Activation MFA impossible.');
    }

    const accessToken = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      campusId: user.campusId,
      mfa: true
    });

    await this.adminRepository.createAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'ADMIN_MFA_ENABLED',
      campusId: user.campusId,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null
    });

    return { token: accessToken };
  }
}
