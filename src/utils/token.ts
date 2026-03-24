import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../types/user-role';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  campusId?: string | null;
  mfa?: boolean;
  typ?: 'access' | 'preauth';
}

export const signAuthToken = (payload: AuthTokenPayload): string => {
  return jwt.sign({ ...payload, typ: payload.typ ?? 'access' }, env.jwtSecret, { expiresIn: '7d' });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  return decoded;
};

export const signPreAuthToken = (payload: Omit<AuthTokenPayload, 'typ' | 'mfa'>): string => {
  return jwt.sign({ ...payload, typ: 'preauth' }, env.jwtSecret, { expiresIn: '10m' });
};
