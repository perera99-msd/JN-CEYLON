import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total, limit } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid var(--border-color)',
      fontSize: '13px',
      color: 'var(--text-secondary)'
    }}>
      <div>
        Showing <strong style={{ color: 'var(--text-main)' }}>{startItem}</strong> to{' '}
        <strong style={{ color: 'var(--text-main)' }}>{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--text-main)' }}>{total}</strong> records
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: page <= 1 ? 'var(--bg-main)' : 'var(--card-bg)',
            color: page <= 1 ? 'var(--text-muted)' : 'var(--text-main)',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '13px'
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span style={{ padding: '0 8px', fontWeight: 500 }}>
          Page {page} of {pages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: page >= pages ? 'var(--bg-main)' : 'var(--card-bg)',
            color: page >= pages ? 'var(--text-muted)' : 'var(--text-main)',
            cursor: page >= pages ? 'not-allowed' : 'pointer',
            fontSize: '13px'
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
