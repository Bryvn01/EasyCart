const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'sw'],
    localeDetection: true,
  },
  localePath: path.resolve('./public/locales'),
};
