module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['plugin:react/recommended', 'standard'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2, {
      SwitchCase: 1

    }],
    'space-before-function-paren': 0,
    semi: ['error', 'always'],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/naming-convention': ['warn', {
      selector: [
        'class',
        'typeLike'
      ],
      format: [
        'PascalCase'
      ]
    }],
    '@typescript-eslint/brace-style': 'error'
  }
};
