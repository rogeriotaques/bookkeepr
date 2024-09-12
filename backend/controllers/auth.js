exports.authenticateUser = async (req, res) => {
  const { password } = req.body;
  const authData = await global.knex('config').where({ key: 'passwd' }).select(['value']).first();

  // TODO: Check if the password (hash) is correct

  const isAuthenticated = !!(authData && authData.value === password);

  res.json({ isAuthenticated });
};

// TODO: Implement a set password method
// TODO: Implement a method to check if password is set
