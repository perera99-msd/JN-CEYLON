import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Receipt, Building2, CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GlobalSearchModal = () => {
  const { isSearchModalOpen, setIsSearchModalOpen } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ quotations: [], invoices: [], companies: [], payments: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ quotations: [], invoices: [], companies: [], payments: [] });
    }
  }, [isSearchModalOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ quotations: [], invoices: [], companies: [], payments: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/search', { params: { q: query.trim() } });
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchModalOpen) return null;

  const handleSelect = (path) => {
    setIsSearchModalOpen(false);
    navigate(path);
  };

  const totalResults =
    results.quotations.length +
    results.invoices.length +
    results.companies.length +
    results.payments.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        zIndex: 9999,
        paddingLeft: '16px',
        paddingRight: '16px'
      }}
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '640px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <Search size={20} color="var(--palette-orange)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quotations, invoices, companies, or payments... (Esc to exit)"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--text-main)'
            }}
          />
          {loading && <Loader2 size={18} className="spin" color="var(--palette-orange)" />}
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px' }}>
          {query.trim().length >= 2 && totalResults === 0 && !loading && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No results found for "{query}"
            </div>
          )}

          {query.trim().length < 2 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              Type at least 2 characters to search across the entire ERP system
            </div>
          )}

          {/* Quotations */}
          {results.quotations.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px' }}>
                Quotations ({results.quotations.length})
              </div>
              {results.quotations.map((q) => (
                <div
                  key={q._id}
                  onClick={() => handleSelect(`/quotations/${q._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  className="search-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={16} color="var(--palette-orange)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>{q.quotationNo}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{q.company?.name || q.custCode} • {q.date}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>${(q.grandTotal || 0).toFixed(2)}</span>
                    <ArrowRight size={14} color="var(--text-secondary)" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invoices */}
          {results.invoices.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px' }}>
                Invoices ({results.invoices.length})
              </div>
              {results.invoices.map((inv) => (
                <div
                  key={inv._id}
                  onClick={() => handleSelect(`/invoices/${inv._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  className="search-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Receipt size={16} color="#3b82f6" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>{inv.invoiceNo}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>PO: {inv.poNumber || 'N/A'} • {inv.company?.name || inv.custCode}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>${(inv.grandTotal || 0).toFixed(2)}</span>
                    <ArrowRight size={14} color="var(--text-secondary)" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Companies */}
          {results.companies.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px' }}>
                Companies ({results.companies.length})
              </div>
              {results.companies.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleSelect('/companies')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  className="search-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building2 size={16} color="#10b981" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Code: {c.custCode || 'N/A'} • {c.contactEmail || c.contactPhone || ''}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-secondary)" />
                </div>
              ))}
            </div>
          )}

          {/* Payments */}
          {results.payments.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px' }}>
                Payments ({results.payments.length})
              </div>
              {results.payments.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleSelect('/payments')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  className="search-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={16} color="#8b5cf6" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>Invoice: {p.invoice?.invoiceNo || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.company?.name || ''} • Ref: {p.reference || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#10b981' }}>+${(p.amount || 0).toFixed(2)}</span>
                    <ArrowRight size={14} color="var(--text-secondary)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-main)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Press <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>Esc</kbd> to close</span>
          <span>Shortcut: <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>Ctrl+K</kbd></span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
