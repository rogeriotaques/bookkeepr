// Update with your config settings.

module.exports = {
  // also staging|production
  development: {
    client: 'sqlite',
    connection: {
      filename: './app/bookkeepr.db'
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true
  }
};
