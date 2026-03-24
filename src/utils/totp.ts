import { createHmac, randomBytes } from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TIME_STEP_SECONDS = 30;

const base32Encode = (buffer: Buffer): string => {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
};

const base32Decode = (input: string): Buffer => {
  const clean = input.toUpperCase().replace(/=+$/g, '').replace(/[^A-Z2-7]/g, '');

  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
};

const hotp = (secret: Buffer, counter: number): string => {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac('sha1', secret).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(code % 1_000_000).padStart(6, '0');
};

export const generateTotpSecret = (): string => {
  return base32Encode(randomBytes(20));
};

export const buildOtpAuthUrl = (params: { issuer: string; accountName: string; secret: string }): string => {
  const issuer = encodeURIComponent(params.issuer);
  const accountName = encodeURIComponent(params.accountName);
  const secret = encodeURIComponent(params.secret);

  return `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=${TIME_STEP_SECONDS}`;
};

export const verifyTotpCode = (params: { secret: string; code: string; window?: number; timestampMs?: number }): boolean => {
  const code = params.code.trim();
  if (!/^[0-9]{6}$/.test(code)) return false;

  const secret = base32Decode(params.secret);
  const window = params.window ?? 1;
  const timestampMs = params.timestampMs ?? Date.now();
  const counter = Math.floor(timestampMs / 1000 / TIME_STEP_SECONDS);

  for (let offset = -window; offset <= window; offset += 1) {
    if (hotp(secret, counter + offset) === code) return true;
  }

  return false;
};

