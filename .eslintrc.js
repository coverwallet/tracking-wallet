const path = require('path');

const BASE_CONFIG_PATH = path.resolve(
  process.cwd(),
  'node_modules/@coverwallet/cw-javascript-coding-standards/base/eslintrc',
);
const FRONTEND_CONFIG_PATH = path.resolve(
  process.cwd(),
  'node_modules/@coverwallet/cw-javascript-coding-standards/frontend/eslintrc',
);

module.exports = {
  extends: [BASE_CONFIG_PATH, FRONTEND_CONFIG_PATH],
  env: {
    browser: true,
    jest: true,
  },
}
