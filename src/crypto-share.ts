import * as crypto from 'crypto';
import * as fs from 'fs';

const ALGORITHM = 'aes-256-gcm';
const KEY_LEN = 32;
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;
const ITERATIONS = 100000;

export function encryptFile(filePath: string, password: string): Buffer {
  const data = fs.readFileSync(filePath);
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, 'sha256');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(data),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  return Buffer.concat([salt, iv, encrypted]);
}
