import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FileText, Receipt, DollarSign, Clock, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = stats?.metrics || {
    totalQuotationCount: 0,
    totalQuotationValue: 0,
    totalInvoiceCount: 0,
    totalInvoiceValue: 0,
    totalPaidValue: 0,
    totalPendingValue: 0,
    pendingInvoicesCount: 0,
    paidInvoicesCount: 0
  };

  return (
    <DashboardLayout title="Executive Overview">
      {/* Quick Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Welcome back, JN Ceylon</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            System overview and quick access to business activities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/quotations/new')} className="btn-primary">
            <Plus size={16} /> New Quotation
          </button>
          <button onClick={() => navigate('/invoices/new')} className="btn-secondary">
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="card">
          <div className="card-title">Pending Balance</div>
          <div className="card-value" style={{ color: 'var(--accent-orange)' }}>
            ${metrics.totalPendingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="card-subtitle">{metrics.pendingInvoicesCount} Invoices Pending Payment</div>
        </div>

        <div className="card">
          <div className="card-title">Total Revenue Collected</div>
          <div className="card-value" style={{ color: 'var(--accent-green)' }}>
            ${metrics.totalPaidValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="card-subtitle">{metrics.paidInvoicesCount} Fully Paid Invoices</div>
        </div>

        <div className="card">
          <div className="card-title">Total Quotation Value</div>
          <div className="card-value" style={{ color: 'var(--accent-blue)' }}>
            ${metrics.totalQuotationValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="card-subtitle">{metrics.totalQuotationCount} Quotations Created</div>
        </div>

        <div className="card">
          <div className="card-title">Total Invoiced Amount</div>
          <div className="card-value" style={{ color: 'var(--accent-purple)' }}>
            ${metrics.totalInvoiceValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="card-subtitle">{metrics.totalInvoiceCount} Total Invoices</div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Quotations */}
        <div className="table-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-blue)" /> Recent Quotations
            </h3>
            <button onClick={() => navigate('/quotations')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total ($)</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentQuotations?.length > 0 ? (
                stats.recentQuotations.map((q) => (
                  <tr key={q._id} onClick={() => navigate(`/quotations/edit/${q._id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 'bold' }}>{q.quotationNo}</td>
                    <td>{q.date}</td>
                    <td><span className={`badge badge-${q.status.toLowerCase()}`}>{q.status}</span></td>
                    <td style={{ fontWeight: 'bold' }}>${(q.grandTotal || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlgin: 'center', color: 'var(--text-secondary)' }}>No quotations created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Invoices */}
        <div className="table-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} color="var(--accent-orange)" /> Recent Invoices
            </h3>
            <button onClick={() => navigate('/invoices')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>PO No</th>
                <th>Status</th>
                <th>Balance ($)</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentInvoices?.length > 0 ? (
                stats.recentInvoices.map((inv) => (
                  <tr key={inv._id} onClick={() => navigate(`/invoices/edit/${inv._id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 'bold' }}>{inv.invoiceNo}</td>
                    <td>{inv.poNumber}</td>
                    <td><span className={`badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                    <td style={{ fontWeight: 'bold', color: inv.balanceDue > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                      ${(inv.balanceDue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlgin: 'center', color: 'var(--text-secondary)' }}>No invoices created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
