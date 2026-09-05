import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Pagination from '../components/common/Pagination';
import SkeletonTable from '../components/common/SkeletonTable';
import { History, Filter, Search, Shield, User, Clock, ArrowUpDown } from 'lucide-react';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, entityFilter]);

  const fetchLogs = async (targetPage = 1) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/activity', {
        params: {
          action: actionFilter,
          entityType: entityFilter,
          search: search.trim() || undefined,
          page: targetPage,
          limit: 20
        }
      });
      setLogs(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'CREATE':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
      case 'UPDATE':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.25)' };
      case 'DELETE':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' };
      case 'DUPLICATE':
        return { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.25)' };
      case 'PAYMENT':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' };
      case 'LOGIN':
        return { bg: 'rgba(14, 165, 233, 0.1)', text: '#0ea5e9', border: 'rgba(14, 165, 233, 0.25)' };
      default:
        return { bg: 'var(--bg-main)', text: 'var(--text-secondary)', border: 'var(--border-color)' };
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout title="System Activity Log">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header summary banner */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '10px',
          padding: '20px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(244, 122, 32, 0.12)',
              color: 'var(--palette-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                Audit Trail & History
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Tamper-evident record of user sign-ins, document creations, duplicates, payments, and modifications.
              </p>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Retention: <strong>90 Days</strong> (auto-pruned)
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="var(--text-secondary)" />
              <select
                className="filter-select"
                style={{ width: 'auto', minWidth: '135px' }}
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="DUPLICATE">Duplicate</option>
                <option value="PAYMENT">Payment</option>
                <option value="LOGIN">Login</option>
              </select>
            </div>

            <select
              className="filter-select"
              style={{ width: 'auto', minWidth: '140px' }}
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <option value="ALL">All Modules</option>
              <option value="QUOTATION">Quotations</option>
              <option value="INVOICE">Invoices</option>
              <option value="PAYMENT">Payments</option>
              <option value="COMPANY">Companies</option>
              <option value="USER">Users</option>
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="search-bar-integrated" style={{ width: '250px' }}>
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search activity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-secondary" style={{ height: '40px', padding: '0 14px' }}>
              Search
            </button>
          </form>
        </div>

        {/* Activity Table */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <SkeletonTable rows={8} columns={5} />
          ) : logs.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <History size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>No activity records found</p>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px' }}>Activities will appear as users interact with the system.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Timestamp</th>
                    <th style={{ width: '140px' }}>User</th>
                    <th style={{ width: '110px' }}>Action</th>
                    <th style={{ width: '110px' }}>Module</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((item) => {
                    const badge = getActionBadgeColor(item.action);
                    return (
                      <tr key={item._id}>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={13} />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} color="var(--text-secondary)" />
                            <span>{item.userName || 'System'}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`
                          }}>
                            {item.action}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 500,
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)'
                          }}>
                            {item.entityType}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-main)' }}>
                          {item.description}
                          {item.entityIdentifier && (
                            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                              ({item.entityIdentifier})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            pagination={pagination}
            onPageChange={(p) => fetchLogs(p)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLogPage;
