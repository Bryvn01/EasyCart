import React from 'react';



class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Sanitize error information before logging to prevent log injection
    const sanitizedError = {
      message: error?.message ? String(error.message).replace(/[\r\n\t]/g, ' ') : 'Unknown error',
      stack: error?.stack ? String(error.stack).replace(/[\r\n\t]/g, ' ').substring(0, 500) : 'No stack trace'
    };
    const sanitizedErrorInfo = {
      componentStack: errorInfo?.componentStack ? String(errorInfo.componentStack).replace(/[\r\n\t]/g, ' ').substring(0, 500) : 'No component stack'
    };
    console.error('Error caught by boundary:', sanitizedError, sanitizedErrorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-16 text-center">
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>⚠️</div>
          <h2 className="text-2xl font-bold mb-4">{this.props.errorTitle || 'Something went wrong'}</h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
            {this.props.errorMessage || "We're sorry, but something unexpected happened."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            {this.props.reloadText || 'Reload Page'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;