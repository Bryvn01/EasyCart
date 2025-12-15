/**
 * Babel Configuration
 *
 * Configures Babel for React Native with TypeScript
 * and module resolution plugins.
 */

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@store': './src/store',
          '@api': './src/api',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@theme': './src/theme',
          '@types': './src/types',
          '@assets': './src/assets',
        },
      },
    ],
    'react-native-reanimated/plugin', // Must be listed last
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
