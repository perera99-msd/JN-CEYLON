import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Pagination from '../../components/common/Pagination';
import SkeletonTable from '../../components/common/SkeletonTable';
import { Trash2, DollarSign, Download } from 'lucide-react';
import { useConfirm } from '../../contexts/ConfirmContext';

const PaymentListPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const confirm = useConfirm();

  useEffect(() => {
    fetchPayments(1);
  }, []);

  const fetchPayments = async (targetPage = 1) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/payments', {
        params: { page: targetPage, limit: 15 }
      });
      if (res.data.pagination) {
        setPayments(res.data.data || []);
        setPagination(res.data.pagination);
      } else {
        setPayments(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/payments/export', '_blank');
  };

  const handleDeletePayment = async (id, amount) => {
    const isConfirmed = await confirm({
      title: 'Revert Payment',
      message: `Are you sure you want to revert this payment of $${amount}? This will restore the invoice balance due.`,
      confirmText: 'Revert Payment',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await axios.delete(`/api/payments/${id}`);
        toast.success(`Payment of $${amount} reverted successfully`);
        fetchPayments(pagination.page);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error reverting payment');
      }
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <DashboardLayout title="Payments & Transactions History">
      {/* Metrics Card & Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="card" style={{ minWidth: '280px' }}>
          <div className="card-title">Total Revenue Recorded</div>
          <div className="card-value" style={{ color: 'var(--accent-green)' }}>
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="card-subtitle">{pagination.total || payments.length} Total Transaction Records</div>
        </div>

        <button onClick={handleExportCSV} className="btn-secondary" title="Export as CSV spreadsheet">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <SkeletonTable rows={8} columns={7} />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice No</th>
                  <th>Customer Company</th>
                  <th>Payment Method</th>
                  <th>Reference / Cheque No</th>
                  <th>Amount ($)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p._id}>
                      <td>{p.date}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>
                        {p.invoice?.invoiceNo || 'N/A'}
                      </td>
                      <td>{p.company?.name || 'Constance Halaveli'}</td>
                      <td>
                        <span className="badge badge-sent">{p.method}</span>
                      </td>
                      <td>{p.reference || '-'}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>
                        +${(p.amount || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeletePayment(p._id, p.amount)}
                          className="btn-danger"
                          title="Revert Payment"
                        >
                          <Trash2 size={14} /> Revert
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              pagination={pagination}
              onPageChange={(p) => fetchPayments(p)}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentListPage;
