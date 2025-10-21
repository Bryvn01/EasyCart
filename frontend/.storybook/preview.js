// .storybook/preview.js
// This file is used to mock Next.js modules that break Storybook, such as next-pwa.
// Add more mocks as needed for other Next.js plugins.

// Mock next-pwa for Storybook
jest.mock('next-pwa', () => () => (config) => config);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
