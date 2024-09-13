const crypto = require('crypto');

exports.authenticateUser = async (req, res) => {
  const { password } = req.body;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const authData = await global.knex('config').where({ key: 'passwd' }).select(['value']).first();

  res.json({ isAuthenticated: !!(authData && authData.value === hashedPassword) });
};

// TODO: Implement a set password method
// TODO: Implement a method to check if password is set
