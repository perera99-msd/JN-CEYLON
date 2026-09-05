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
  FileSpreadsheet,
  History,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const quickNavItems = [
  { title: 'Quotations', subtitle: 'View & manage sales quotations', path: '/quotations', icon: FileText },
  { title: 'Invoices', subtitle: 'Billing, receivables & payment tracking', path: '/invoices', icon: Receipt },
  { title: 'Account Statements', subtitle: 'Customer ledger & account summaries', path: '/statements', icon: FileSpreadsheet },
  { title: 'Client Companies', subtitle: 'Customer directory & address profiles', path: '/companies', icon: Building2 },
  { title: 'Activity Log', subtitle: 'System audit trail & user events', path: '/activity', icon: History }
];

const quickActionItems = [
  { title: 'New Quotation', subtitle: 'Create and issue a quotation', path: '/quotations/new', icon: Plus },
  { title: 'New Invoice', subtitle: 'Create a direct customer invoice', path: '/invoices/new', icon: Plus }
];

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
    }, 220);

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
        paddingTop: '80px',
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
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '600px',
          overflow: 'hidden',
          animation: 'slideUpModal 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff'
        }}>
          <Search size={18} color="#64748b" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontWeight: 500,
              color: '#0f172a',
              fontFamily: 'inherit'
            }}
          />
          {loading && <Loader2 size={16} className="spin" color="#64748b" />}
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
              <X size={15} />
            </button>
          )}
          <kbd style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            fontWeight: 600,
            lineHeight: 1
          }}>
            ESC
          </kbd>
        </div>

        {/* Content Area */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '10px', backgroundColor: '#ffffff' }}>
          {/* Empty search: Quick Navigation & Actions */}
          {query.trim().length < 2 && (
            <div style={{ padding: '4px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '6px 12px 4px 12px'
              }}>
                Navigation
              </div>
              {quickNavItems.map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <item.icon size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{item.subtitle}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Jump</span>
                </div>
              ))}

              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '12px 12px 4px 12px'
              }}>
                Actions
              </div>
              {quickActionItems.map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(244, 122, 32, 0.1)',
                      color: 'var(--palette-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <item.icon size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{item.subtitle}</div>
                    </div>
                  </div>
                  <ArrowUpRight size={14} color="#94a3b8" />
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.trim().length >= 2 && totalResults === 0 && !loading && (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                No matching records found
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Try searching by document number (e.g. 158RC, 111INVO) or customer name.
              </p>
            </div>
          )}

          {/* Quotations */}
          {results.quotations.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#64748b', 
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
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(244, 122, 32, 0.1)',
                      color: 'var(--palette-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{q.quotationNo}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{q.company?.name || q.custCode} • {q.date}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>${(q.grandTotal || 0).toFixed(2)}</span>
                    <ArrowRight size={13} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invoices */}
          {results.invoices.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#64748b', 
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
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Receipt size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{inv.invoiceNo}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>PO: {inv.poNumber || 'N/A'} • {inv.company?.name || inv.custCode}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>${(inv.grandTotal || 0).toFixed(2)}</span>
                    <ArrowRight size={13} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Companies */}
          {results.companies.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#64748b', 
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
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Building2 size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>Code: {c.custCode || 'N/A'} • {c.contactEmail || c.contactPhone || 'Client Account'}</div>
                    </div>
                  </div>
                  <ArrowRight size={13} color="#94a3b8" />
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
                color: '#64748b', 
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
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      color: '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CreditCard size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>Invoice: {p.invoice?.invoiceNo || 'N/A'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{p.company?.name || ''} • Ref: {p.reference || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#10b981' }}>+${(p.amount || 0).toFixed(2)}</span>
                    <ArrowRight size={13} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 18px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          fontSize: '11.5px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Press <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0', fontWeight: 600, color: '#475569' }}>Esc</kbd> to close</span>
          <span>Shortcut: <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0', fontWeight: 600, color: '#475569' }}>Ctrl+K</kbd></span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
