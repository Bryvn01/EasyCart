module.exports = {
  root: true,
  extends: ['@react-native/eslint-config'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@react-native/babel-preset'],
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react-native/no-inline-styles': 'warn',
  },
  overrides: [
    {
      // TypeScript files use TypeScript parser
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};
