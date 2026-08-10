import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, Search, Filter, Eye, Printer, Edit3, Trash2, DollarSign, CreditCard, Download } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';
import { useNavigate } from 'react-router-dom';

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Payment Modal State
  const [paymentModalItem, setPaymentModalItem] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/invoices', {
        params: { status: statusFilter, search }
      });
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleDelete = async (id, invoiceNo) => {
    if (window.confirm(`Are you sure you want to delete invoice "${invoiceNo}"?`)) {
      try {
        await axios.delete(`/api/invoices/${id}`);
        fetchInvoices();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting invoice');
      }
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentModalItem) return;
    const amountNum = parseFloat(payAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid payment amount!');
      return;
    }

    try {
      await axios.post('/api/payments', {
        invoiceId: paymentModalItem._id,
        amount: amountNum,
        method: payMethod,
        reference: payRef
      });
      alert('Payment recorded successfully!');
      setPaymentModalItem(null);
      setPayAmount('');
      setPayRef('');
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Error recording payment');
    }
  };

  return (
    <DashboardLayout title="Invoices & Ledger Management">
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <div className="form-group" style={{ margin: 0, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search Invoice No / PO No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-secondary">
              <Search size={16} /> Search
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 500
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Payment</option>
            <option value="PARTIAL">Partial Payment</option>
            <option value="PAID">Fully Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <button onClick={() => navigate('/invoices/new')} className="btn-primary">
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>PO Number</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total ($)</th>
              <th>Balance Due ($)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv._id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>{inv.invoiceNo}</td>
                  <td style={{ fontWeight: 'bold' }}>{inv.poNumber}</td>
                  <td>{inv.date}</td>
                  <td>{inv.company?.name || 'Constance Halaveli'}</td>
                  <td>
                    <span className={`badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>${(inv.grandTotal || 0).toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold', color: inv.balanceDue > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                    ${(inv.balanceDue || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => {
                            setPaymentModalItem(inv);
                            setPayAmount(inv.balanceDue.toFixed(2));
                          }}
                          className="btn-secondary"
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}
                          title="Record Payment"
                        >
                          <CreditCard size={14} /> Pay
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/invoices/view/${inv._id}`)}
                        className="btn-secondary"
                        title="View Document"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => navigate(`/invoices/edit/${inv._id}`)}
                        className="btn-secondary"
                        title="Edit Invoice"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => printDocumentInIframe(`/print/invoice/${inv._id}`)}
                        className="btn-secondary"
                        title="Print PDF"
                      >
                        <Printer size={14} /> Print
                      </button>
                      <button
                        onClick={() => handleDelete(inv._id, inv.invoiceNo)}
                        className="btn-danger"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No invoices found. Click "Create Invoice" to start!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {paymentModalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '12px', width: '440px',
            border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ marginTop: 0 }}>Record Payment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Invoice: <strong>{paymentModalItem.invoiceNo}</strong> | PO: <strong>{paymentModalItem.poNumber}</strong><br />
              Total: ${paymentModalItem.grandTotal.toFixed(2)} | Balance Due: <strong style={{ color: 'var(--accent-orange)' }}>${paymentModalItem.balanceDue.toFixed(2)}</strong>
            </p>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Payment Amount ($):</label>
              <input
                type="number"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Payment Method:</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                <option value="BANK_TRANSFER">Bank Transfer (TT)</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Reference / Cheque No / Transaction ID:</label>
              <input
                type="text"
                placeholder="e.g. TXN-998812"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPaymentModalItem(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleRecordPayment} className="btn-primary">Record Payment</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InvoiceListPage;
