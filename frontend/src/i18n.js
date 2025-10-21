import NextI18Next from 'next-i18next';

const NextI18NextInstance = new NextI18Next({
  defaultLanguage: 'en',
  otherLanguages: ['sw'],
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
});

export default NextI18NextInstance;
export const { appWithTranslation, useTranslation, i18n } = NextI18NextInstance;
