import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorMessage = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      background: 'rgba(231, 76, 60, 0.1)',
      border: '1px solid var(--error)',
      borderRadius: 'var(--border-radius)',
      margin: '1.5rem 0',
      textAlign: 'center',
      gap: '0.75rem',
    }}>
      <FaExclamationTriangle style={{ color: 'var(--error)', fontSize: '2rem' }} />
      <p style={{ color: 'var(--error)', fontWeight: 500 }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--error)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
