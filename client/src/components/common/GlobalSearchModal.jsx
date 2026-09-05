import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  FileText, 
  Receipt, 
  Building2, 
  CreditCard, 
  Loader2, 
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
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
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '90px',
        zIndex: 9999,
        paddingLeft: '16px',
        paddingRight: '16px',
        animation: 'fadeInBackdrop 0.15s ease-out'
      }}
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          width: '100%',
          maxWidth: '640px',
          overflow: 'hidden',
          animation: 'slideUpModal 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff'
        }}>
          <Search size={22} color="var(--palette-orange)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quotations, invoices, companies, or payments..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontWeight: 500,
              color: '#0f172a',
              fontFamily: 'inherit'
            }}
          />
          {loading && <Loader2 size={18} className="spin" color="var(--palette-orange)" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(false)}
            style={{
              background: '#f1f5f9',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Content */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px', backgroundColor: '#ffffff' }}>
          {query.trim().length >= 2 && totalResults === 0 && !loading && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                backgroundColor: '#f1f5f9', 
                color: '#94a3b8', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 12px auto' 
              }}>
                <Search size={22} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>No results found</div>
              <div style={{ fontSize: '13px', marginTop: '4px', color: '#64748b' }}>
                We couldn't find anything matching "<strong>{query}</strong>". Try searching by quotation number, invoice number, or company name.
              </div>
            </div>
          )}

          {query.trim().length < 2 && (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(244, 122, 32, 0.12)',
                color: 'var(--palette-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}>
                <Sparkles size={24} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                Search Across JN Ceylon ERP
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', maxWidth: '380px', margin: '4px auto 16px auto', lineHeight: '1.4' }}>
                Type at least 2 characters to search across all Quotations, Invoices, Client Companies, and Payments.
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569' }}>
                  📄 Quotation (e.g. 158RC...)
                </span>
                <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569' }}>
                  🧾 Invoice (e.g. 111NVO...)
                </span>
                <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569' }}>
                  🏢 Company Name / Code
                </span>
                <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569' }}>
                  💳 Payment Reference
                </span>
              </div>
            </div>
          )}

          {/* Quotations */}
          {results.quotations.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: 'var(--palette-orange)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em', 
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FileText size={13} /> Quotations ({results.quotations.length})
              </div>
              {results.quotations.map((q) => (
                <div
                  key={q._id}
                  onClick={() => handleSelect(`/quotations/${q._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(244, 122, 32, 0.1)',
                      color: 'var(--palette-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>{q.quotationNo}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{q.company?.name || q.custCode} • Date: {q.date}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>${(q.grandTotal || 0).toFixed(2)}</span>
                    <ArrowRight size={14} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invoices */}
          {results.invoices.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#2563eb', 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em', 
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Receipt size={13} /> Invoices ({results.invoices.length})
              </div>
              {results.invoices.map((inv) => (
                <div
                  key={inv._id}
                  onClick={() => handleSelect(`/invoices/${inv._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Receipt size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>{inv.invoiceNo}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>PO: {inv.poNumber || 'N/A'} • {inv.company?.name || inv.custCode}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>${(inv.grandTotal || 0).toFixed(2)}</span>
                    <ArrowRight size={14} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Companies */}
          {results.companies.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#10b981', 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em', 
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Building2 size={13} /> Companies ({results.companies.length})
              </div>
              {results.companies.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleSelect('/companies')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Code: {c.custCode || 'N/A'} • {c.contactEmail || c.contactPhone || 'Client Account'}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="#94a3b8" />
                </div>
              ))}
            </div>
          )}

          {/* Payments */}
          {results.payments.length > 0 && (
            <div>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#8b5cf6', 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em', 
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CreditCard size={13} /> Payments ({results.payments.length})
              </div>
              {results.payments.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleSelect('/payments')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      color: '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>Invoice: {p.invoice?.invoiceNo || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{p.company?.name || ''} • Ref: {p.reference || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#10b981' }}>+${(p.amount || 0).toFixed(2)}</span>
                    <ArrowRight size={14} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          fontSize: '12px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Press <kbd style={{ padding: '2px 6px', borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0', fontWeight: 600, color: '#475569' }}>Esc</kbd> to close</span>
          <span>Shortcut: <kbd style={{ padding: '2px 6px', borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0', fontWeight: 600, color: '#475569' }}>Ctrl+K</kbd></span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
