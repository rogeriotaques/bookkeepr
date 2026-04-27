const crypto = require('crypto');
const { hashPassword, verifyPassword } = require('@/lib/auth');

exports.authenticateUser = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: 'Missing password' });
  }

  const authData = await global.knex('config').where({ key: 'passwd' }).select(['value']).first();

  if (!authData || !authData.value) {
    return res.json({ isAuthenticated: false });
  }

  const valid = verifyPassword(password, authData.value);

  // Migrate old SHA-256 hash to PBKDF2 on successful login
  if (valid && !authData.value.includes(':')) {
    const newHash = hashPassword(password);
    await global.knex('config').where({ key: 'passwd' }).update({ value: newHash });
  }

  res.json({ isAuthenticated: valid });
};

exports.saveUserPassword = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: 'Missing password' });
  }

  const hashedPassword = hashPassword(password);

  await global
    .knex('config')
    .insert([
      { key: 'passwd', value: hashedPassword },
      { key: 'usePasswd', value: 1 },
    ])
    .onConflict('key')
    .merge();

  res.json({ success: true });
};

exports.deleteUserPassword = async (_req, res) => {
  await Promise.allSettled([
    global.knex('config').where({ key: 'passwd' }).delete(),
    global.knex('config').where({ key: 'usePasswd' }).update({ value: 0 }),
  ]);

  res.json({ success: true });
};

// TODO: Implement a method to check if user is authenticated
