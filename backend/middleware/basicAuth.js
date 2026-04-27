/**
 * BOOKKEEPR
 * Basic Auth Middleware
 */

const crypto = require('crypto');
const { verifyPassword, hashPassword } = require('@/lib/auth');

/**
 * RegExp for basic auth credentials
 *
 * credentials = auth-scheme 1*SP token68
 * auth-scheme = "Basic" ; case insensitive
 * token68     = 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" ) *"="
 * @private
 */
const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;

/**
 * RegExp for basic auth user/pass
 *
 * user-pass   = userid ":" password
 * userid      = *<TEXT excluding ":">
 * password    = *TEXT
 * @private
 */
const USER_PASS_REGEXP = /^([^:]*):(.*)$/;

/**
 * Object to represent user credentials.
 * @private
 */
const Credentials = function (name, pass) {
  this.name = name;
  this.pass = pass;
};

/**
 * Get the Authorization header from request object.
 * @private
 */
const getAuthorizationHeader = (req) => {
  if (!req.headers || typeof req.headers !== 'object') {
    throw new TypeError('argument req is required to have headers property');
  }

  return req.headers.authorization;
};

/**
 * Parse basic auth to object.
 *
 * @param {string} string
 * @return {object}
 * @public
 */
const parse = (string) => {
  if (typeof string !== 'string') {
    return undefined;
  }

  // parse header
  const match = CREDENTIALS_REGEXP.exec(string);

  if (!match) {
    return undefined;
  }

  // decode user pass
  let userPass = '';

  try {
    userPass = USER_PASS_REGEXP.exec(atob(match[1]));
  } catch (e) {}

  if (!userPass) {
    return new Credentials('', '');
  }

  // return credentials object
  return new Credentials(userPass[1], userPass[2]);
};

const safeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

const basicAuth = async (req, res, next) => {
  if (!global.knex) {
    throw new TypeError('database not initialized');
  }

  const isAppUsingPassword = await global
    .knex('config')
    .where({ key: 'usePasswd' })
    .select(['value'])
    .first()
    .then((row) => (row ? row.value : 0))
    .catch(() => 0);

  if (isAppUsingPassword == 0) {
    return next();
  }

  if (!req) {
    throw new TypeError('argument req is required');
  }

  if (typeof req !== 'object') {
    throw new TypeError('argument req is required to be an object');
  }

  const authorization = getAuthorizationHeader(req);

  if (!authorization) {
    return res.status(401).send('Unauthorized');
  }

  const { name, pass } = parse(authorization);

  if (!name || !pass) {
    return res.status(401).send('Unauthorized');
  }

  const expectedPassword = await global
    .knex('config')
    .where({ key: 'passwd' })
    .select(['value'])
    .first()
    .then((row) => (row ? row.value : ''))
    .catch(() => '');

  if (!verifyPassword(pass, expectedPassword)) {
    return res.status(401).send('Unauthorized');
  }

  // Migrate old SHA-256 hash to PBKDF2 on successful auth
  if (!expectedPassword.includes(':')) {
    const newHash = hashPassword(pass);
    await global.knex('config').where({ key: 'passwd' }).update({ value: newHash });
  }

  next();
};

module.exports = basicAuth;
