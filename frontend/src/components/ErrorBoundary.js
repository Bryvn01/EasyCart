import React from 'react';
import { analytics } from '../services/analytics';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Track error for analytics
    analytics.track('Error Boundary Triggered', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        retryCount: this.state.retryCount + 1 
      });
    } else {
      // After 3 retries, redirect to home
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {this.state.retryCount < 3 
                  ? "We're having trouble loading this page. This might be a temporary issue."
                  : "Multiple errors occurred. We'll redirect you to the home page."
                }
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-3 justify-center">
                {this.state.retryCount < 3 ? (
                  <button
                    onClick={this.handleRetry}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Try Again ({3 - this.state.retryCount} attempts left)
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Go to Home
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;