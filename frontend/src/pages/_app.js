import * as Sentry from '@sentry/nextjs';
import { appWithTranslation } from 'next-i18next';
import '../i18n';
import { LanguageSwitcher } from '../components/ProductList';
import '../styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MyAppWrapper from '../components/MyAppWrapper';
import { reportWebVitals } from '../reportWebVitals';
import ReactQueryProvider from '../components/ReactQueryProvider';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  tracesSampleRate: 1.0, // Adjust for production
  environment: process.env.NODE_ENV,
});

function MyApp({ Component, pageProps }) {
  return (
    <MyAppWrapper>
      <ReactQueryProvider>
        <GlobalErrorBoundary>
          <LanguageSwitcher />
          <Component {...pageProps} />
          <ToastContainer />
        </GlobalErrorBoundary>
      </ReactQueryProvider>
    </MyAppWrapper>
  );
}

export default appWithTranslation(MyApp);
export { reportWebVitals };