import React from 'react';

/**
 * Enhanced Error Boundary Component
 * Catches React errors and provides fallback UI
 * Integrates with error tracking service
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Track error (integrate with service like Sentry)
    this.trackError(error, errorInfo);
  }

  trackError(error, errorInfo) {
    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    // For now, send to backend logging endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch(`${process.env.REACT_APP_API_URL}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          errorInfo,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(err => {
        console.error('Failed to send error report:', err);
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            color: '#dc3545'
          }}>
            ⚠️
          </div>
          
          <h2 style={{
            color: '#343a40',
            marginBottom: '10px',
            fontSize: '24px'
          }}>
            Something went wrong
          </h2>
          
          <p style={{
            color: '#6c757d',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            We're sorry, but something unexpected happened. Our team has been notified.
          </p>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div style={{
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'left',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '200px',
              border: '1px solid #dee2e6'
            }}>
              <strong style={{ color: '#dc3545' }}>Error:</strong> {this.state.error.toString()}
              {this.state.error.stack && (
                <pre style={{
                  marginTop: '10px',
                  fontSize: '11px',
                  color: '#6c757d',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Try Again
            </button>
            
            <button 
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Reload Page
            </button>

            <button 
              onClick={() => window.history.back()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Go Back
            </button>
          </div>

          {this.state.errorCount > 1 && (
            <p style={{
              marginTop: '20px',
              fontSize: '12px',
              color: '#dc3545'
            }}>
              This error has occurred {this.state.errorCount} times. Please reload the page.
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;