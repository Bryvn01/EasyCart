import React from 'react';
import './ViewModeToggle.css';

/**
 * Toggle component for switching between pagination and infinite scroll
 * Mobile-first, accessible, and follows PWA best practices
 */
const ViewModeToggle = ({ mode, onModeChange }) => {
  return (
    <div className="view-mode-toggle" role="group" aria-label="View mode selection">
      <button
        onClick={() => onModeChange('pagination')}
        className={`view-mode-btn ${mode === 'pagination' ? 'active' : ''}`}
        aria-pressed={mode === 'pagination'}
        aria-label="Pagination view"
      >
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM2 12a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="view-mode-label">Pages</span>
      </button>
      <button
        onClick={() => onModeChange('infinite')}
        className={`view-mode-btn ${mode === 'infinite' ? 'active' : ''}`}
        aria-pressed={mode === 'infinite'}
        aria-label="Infinite scroll view"
      >
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
        <span className="view-mode-label">Scroll</span>
      </button>
    </div>
  );
};

export default ViewModeToggle;
