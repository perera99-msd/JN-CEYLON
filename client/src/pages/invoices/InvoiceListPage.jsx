import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Pagination from '../../components/common/Pagination';
import SkeletonTable from '../../components/common/SkeletonTable';
import { Plus, Search, Filter, Eye, Printer, Edit3, Trash2, DollarSign, CreditCard, Download, Calendar } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../contexts/ConfirmContext';

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  
  // Payment Modal State
  const [paymentModalItem, setPaymentModalItem] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');

  // Due Date Modal State
  const [dueDateModalItem, setDueDateModalItem] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [savingDueDate, setSavingDueDate] = useState(false);

  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    fetchInvoices(1);
  }, [statusFilter]);

  const fetchInvoices = async (targetPage = 1) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/invoices', {
        params: {
          status: statusFilter,
          search: search.trim() || undefined,
          page: targetPage,
          limit: 15
        }
      });
      if (res.data.pagination) {
        setInvoices(res.data.data || []);
        setPagination(res.data.pagination);
      } else {
        setInvoices(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/invoices/export', '_blank');
  };

  const handleOpenDueDateModal = (inv) => {
    setDueDateModalItem(inv);
    const current = inv.dueDate || inv.date;
    if (current && current.includes('.')) {
      const parts = current.split('.');
      if (parts.length === 3) {
        setNewDueDate(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
        return;
      }
    }
    setNewDueDate('');
  };

  const handleSaveDueDateModal = async () => {
    if (!dueDateModalItem || !newDueDate) return;
    try {
      setSavingDueDate(true);
      const parts = newDueDate.split('-');
      const formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;

      await axios.patch(`/api/invoices/${dueDateModalItem._id}/due-date`, {
        dueDate: formattedDate
      });

      toast.success('Due date updated successfully!');
      setDueDateModalItem(null);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating due date');
    } finally {
      setSavingDueDate(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleDelete = async (id, invoiceNo) => {
    const isConfirmed = await confirm({
      title: 'Delete Invoice',
      message: `Are you sure you want to delete invoice "${invoiceNo}"? This action cannot be undone.`,
      confirmText: 'Delete Invoice',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await axios.delete(`/api/invoices/${id}`);
        toast.success(`Invoice "${invoiceNo}" deleted successfully`);
        fetchInvoices();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting invoice');
      }
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentModalItem) return;
    const amountNum = parseFloat(payAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid payment amount!');
      return;
    }

    try {
      await axios.post('/api/payments', {
        invoiceId: paymentModalItem._id,
        amount: amountNum,
        method: payMethod,
        reference: payRef
      });
      toast.success('Payment recorded successfully!');
      setPaymentModalItem(null);
      setPayAmount('');
      setPayRef('');
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording payment');
    }
  };

  return (
    <DashboardLayout title="Invoices & Ledger Management">
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Payment</option>
            <option value="PARTIAL">Partial Payment</option>
            <option value="PAID">Fully Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn-secondary" title="Export as CSV spreadsheet">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => navigate('/invoices/new')} className="btn-primary">
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <SkeletonTable rows={8} columns={9} />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>PO Number</th>
                  <th>Date</th>
                  <th>Due Date</th>
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
                      <td>{inv.poNumber}</td>
                      <td>{inv.date}</td>
                      <td>
                        <button
                          onClick={() => handleOpenDueDateModal(inv)}
                          className="btn-secondary"
                          style={{
                            padding: '3px 8px',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: inv.status === 'OVERDUE' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-main)',
                            color: inv.status === 'OVERDUE' ? '#f87171' : 'var(--text-main)',
                            borderColor: inv.status === 'OVERDUE' ? '#ef4444' : 'var(--border-color)'
                          }}
                          title="Click to change Due Date"
                        >
                          <Calendar size={12} />
                          <span>{inv.dueDate || inv.date}</span>
                        </button>
                      </td>
                      <td>{inv.company?.name || 'Constance Halaveli'}</td>
                      <td>
                        <span className={`badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>${(inv.grandTotal || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 'bold', color: inv.balanceDue > 0 ? 'var(--accent-orange)' : '#4ade80' }}>
                        ${(inv.balanceDue || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setPaymentModalItem(inv);
                                setPayAmount(inv.balanceDue ? inv.balanceDue.toFixed(2) : '');
                              }}
                              className="btn-secondary"
                              style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)' }}
                              title="Record Payment"
                            >
                              <DollarSign size={14} /> Record Payment
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
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No invoices found. Click "Create Invoice" to start!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              pagination={pagination}
              onPageChange={(p) => fetchInvoices(p)}
            />
          </>
        )}
      </div>

      {/* Edit Due Date Modal */}
      {dueDateModalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', padding: '28px', borderRadius: '12px', width: '400px',
            border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Set Invoice Due Date</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Invoice: <strong style={{ color: 'var(--accent-orange)' }}>{dueDateModalItem.invoiceNo}</strong> | Current Due: <strong>{dueDateModalItem.dueDate || dueDateModalItem.date}</strong>
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Select New Due Date (Calendar):</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  width: '100%',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDueDateModalItem(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveDueDateModal} disabled={savingDueDate} className="btn-primary">
                {savingDueDate ? 'Saving...' : 'Save Due Date'}
              </button>
            </div>
          </div>
        </div>
      )}

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
