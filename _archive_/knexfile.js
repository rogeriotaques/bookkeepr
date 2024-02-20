// Update with your config settings.

module.exports = {
  // also staging|production
  development: {
    client: 'sqlite',
    connection: {
      filename: './api/bookkeepr.db',
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    useNullAsDefault: true,
  },
};
