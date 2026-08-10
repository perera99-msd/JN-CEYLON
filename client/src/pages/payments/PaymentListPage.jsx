import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Trash2, DollarSign } from 'lucide-react';

const PaymentListPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/payments');
      setPayments(res.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (id, amount) => {
    if (window.confirm(`Revert payment of $${amount}? This will restore the invoice balance due.`)) {
      try {
        await axios.delete(`/api/payments/${id}`);
        fetchPayments();
      } catch (error) {
        alert(error.response?.data?.message || 'Error reverting payment');
      }
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <DashboardLayout title="Payments & Transactions History">
      {/* Metrics Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="card" style={{ width: '320px' }}>
          <div className="card-title">Total Revenue Recorded</div>
          <div className="card-value" style={{ color: 'var(--accent-green)' }}>
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="card-subtitle">{payments.length} Transaction Records</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
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
      </div>
    </DashboardLayout>
  );
};

export default PaymentListPage;
