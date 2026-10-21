require('module-alias/register');

const path = require('path');

// Ensure module aliases are registered before any tests run
process.env.NODE_ENV = 'test';
