const crypto = require('crypto');

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('base64');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('base64');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  if (stored.includes(':')) {
    const [salt, hash] = stored.split(':');
    const computed = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('base64');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
  }

  // Old SHA-256 format — verify without migrating here (caller decides)
  const oldHash = crypto.createHash('sha256').update(password).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(oldHash));
};

module.exports = { hashPassword, verifyPassword };
