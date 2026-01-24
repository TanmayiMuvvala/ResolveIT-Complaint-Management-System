import React from 'react';

export default function UIStateMessage({ state, message, onRetry }) {
  if (state === 'loading') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        color: '#495057',
        fontSize: '14px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #e9ecef',
          borderTop: '2px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span>{message || 'Processing...'}</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        color: '#155724',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '16px' }}>✅</span>
        <span>{message}</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        color: '#721c24',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: onRetry ? '10px' : '0' }}>
          <span style={{ fontSize: '16px' }}>❌</span>
          <span>{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}