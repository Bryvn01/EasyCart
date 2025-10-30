import React from 'react';

const ApiEnvWarning = ({ baseUrl }) => {
  if (!baseUrl || baseUrl === 'undefined' || baseUrl.includes('undefined')) {
    return (
      <div style={{
        background: '#ffcccc',
        color: '#900',
        padding: '16px',
        textAlign: 'center',
        fontWeight: 'bold',
        borderBottom: '2px solid #900',
        zIndex: 9999,
        position: 'relative',
      }}>
        ⚠️ API base URL is not set! Please check your .env file (REACT_APP_API_URL) and restart the frontend server.
      </div>
    );
  }
  return null;
};

export default ApiEnvWarning;