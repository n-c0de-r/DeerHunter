module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    THREE: 'readonly',
    AMMO: 'readonly',
    PARSELY: 'readonly',
    gsap: 'readonly',
    _gaq: 'readonly',
    gtag: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
  },
  rules: {
    'max-len': ['warn', { code: 180, ignoreComments: true }],
    'linebreak-style': 0,
    'spaced-comment': 0,
    'no-console': 0,
    'no-use-before-define': 0,
    'brace-style': 0,
    'no-param-reassign': 0,
    'no-multi-assign': 0,
    'function-paren-newline': 0,
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    'comma-dangle': 0,
    'no-new': 0,
  },
};
