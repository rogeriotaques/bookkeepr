const crypto = require('crypto');

exports.authenticateUser = async (req, res) => {
  const { password } = req.body;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const authData = await global.knex('config').where({ key: 'passwd' }).select(['value']).first();

  res.json({ isAuthenticated: !!(authData && authData.value === hashedPassword) });
};

exports.saveUserPassword = async (req, res) => {
  const { password } = req.body;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

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

// TODO: Implement a method to check if user is authenticated
