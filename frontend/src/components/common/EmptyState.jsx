import React from 'react';
import { FaInbox } from 'react-icons/fa';

const EmptyState = ({
  icon: Icon = FaInbox,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3.5rem 1rem',
      background: 'var(--surface)',
      border: '1px dashed var(--border)',
      borderRadius: 'var(--border-radius)',
      margin: '1.5rem 0',
      textAlign: 'center',
      gap: '0.75rem',
    }}>
      <Icon style={{ color: 'var(--text-muted)', fontSize: '2.5rem' }} />
      <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '0.5rem',
            padding: '0.6rem 1.25rem',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
