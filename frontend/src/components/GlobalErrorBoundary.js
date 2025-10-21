import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

function ErrorFallback({ error, resetErrorBoundary }) {
  const { t } = useTranslation();
  return (
    <div role="alert" style={{ padding: 32, textAlign: 'center' }}>
      <h2 style={{ color: '#b91c1c' }}>{t('somethingWentWrong', 'Something went wrong')}</h2>
      <pre style={{ color: '#991b1b', margin: '16px 0' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}>
        {t('tryAgain', 'Try Again')}
      </button>
    </div>
  );
}

export default function GlobalErrorBoundary({ children }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
