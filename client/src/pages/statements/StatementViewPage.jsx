import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatementTemplate from '../../components/templates/StatementTemplate';
import { Printer, ArrowLeft, Filter, Calendar } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';

const StatementViewPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [dateRangePreset, setDateRangePreset] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchStatementData();
  }, [companyId, dateRangePreset, startDate, endDate, statusFilter]);

  const handlePresetChange = (preset) => {
    setDateRangePreset(preset);
    const now = new Date();
    if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'LAST_MONTH') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      setStartDate(oneMonthAgo.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'LAST_3_MONTHS') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      setStartDate(threeMonthsAgo.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    }
  };

  const fetchStatementData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get(`/api/statements/company/${companyId}`, { params });
      setStatementData(res.data);
    } catch (error) {
      console.error('Error fetching statement data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={`Account Statement — ${statementData?.company?.name || ''}`}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => navigate('/statements')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Statements
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => printDocumentInIframe(`/print/statement/${companyId}`)} className="btn-primary">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>
            <Filter size={16} /> Filter By:
          </div>

          {/* Date Range Preset Selector */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Calendar size={15} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={dateRangePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'var(--bg-main)', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <option value="ALL">All Time</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month to Today</option>
              <option value="LAST_3_MONTHS">Last 3 Months to Today</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {dateRangePreset === 'CUSTOM' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'var(--bg-main)' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'var(--bg-main)' }}
              />
            </div>
          )}

          {/* Payment Status Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'var(--bg-main)', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <option value="ALL">All Payments</option>
              <option value="PENDING">Pending Payment</option>
              <option value="PAID">Paid Payment</option>
            </select>
          </div>
        </div>

        {/* Status indicator count */}
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--palette-slate)', background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          Found {statementData?.items?.length || 0} Invoice(s)
        </div>
      </div>

      {/* Workspace Preview */}
      <div style={{
        backgroundColor: '#525659',
        borderRadius: '12px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '80vh',
        overflowY: 'auto'
      }}>
        {loading ? (
          <div style={{ color: '#fff', fontSize: '16px' }}>Loading Account Statement...</div>
        ) : (
          <StatementTemplate data={statementData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StatementViewPage;
