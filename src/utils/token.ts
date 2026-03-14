import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

export const signAuthToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  return decoded;
};
