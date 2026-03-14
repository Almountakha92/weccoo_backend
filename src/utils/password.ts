import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedPassword: string): boolean => {
  const [salt, storedHash] = storedPassword.split(':');

  if (!salt || !storedHash) {
    return storedPassword === password;
  }

  const computedHash = scryptSync(password, salt, KEY_LENGTH);
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  if (computedHash.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedHash, storedHashBuffer);
};
