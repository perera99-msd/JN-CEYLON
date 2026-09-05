import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const SkeletonTable = ({ rows = 5, columns = 6 }) => {
  const [showColdStartNote, setShowColdStartNote] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowColdStartNote(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '24px 16px' }}>
      {showColdStartNote && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(244, 122, 32, 0.08)',
          border: '1px solid rgba(244, 122, 32, 0.25)',
          color: 'var(--palette-orange)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Loader2 size={18} className="spin" />
          <span>Server is waking up from free-tier standby... This takes a few moments on the first request.</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '16px',
              padding: '14px 16px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-main)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                style={{
                  height: '14px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--border-color)',
                  width: cIdx === 0 ? '60%' : cIdx === columns - 1 ? '40%' : '80%'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTable;
