import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, Search, Eye, Printer, Download, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../contexts/ConfirmContext';

const QuotationListPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [poModalItem, setPoModalItem] = useState(null);
  const [poNumberInput, setPoNumberInput] = useState('');
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/quotations', {
        params: { status: statusFilter, search }
      });
      setQuotations(res.data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuotations();
  };

  const handleDelete = async (id, quotationNo) => {
    const isConfirmed = await confirm({
      title: 'Delete Quotation',
      message: `Are you sure you want to delete quotation "${quotationNo}"? This action cannot be undone.`,
      confirmText: 'Delete Quotation',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await axios.delete(`/api/quotations/${id}`);
        toast.success(`Quotation "${quotationNo}" deleted successfully`);
        fetchQuotations();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting quotation');
      }
    }
  };

  const handleCreateInvoiceWithPO = async () => {
    if (!poModalItem) return;
    if (!poNumberInput.trim()) {
      toast.error('Please enter the Purchase Order (PO) number received from the client.');
      return;
    }

    try {
      const res = await axios.post(`/api/invoices/from-quotation/${poModalItem._id}`, {
        poNumber: poNumberInput.trim()
      });
      toast.success(`Invoice "${res.data.invoiceNo}" created successfully from Quotation "${poModalItem.quotationNo}"!`);
      setPoModalItem(null);
      setPoNumberInput('');
      navigate(`/invoices/edit/${res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating invoice');
    }
  };

  return (
    <DashboardLayout title="Quotations Management">
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <div className="form-group" style={{ margin: 0, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search Quotation No..."
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
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PO_RECEIVED">PO Received</option>
            <option value="CONVERTED">Converted to Invoice</option>
          </select>
        </div>

        <button onClick={() => navigate('/quotations/new')} className="btn-primary">
          <Plus size={16} /> Create Quotation
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quotation No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Cust. Code</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length > 0 ? (
              quotations.map((q) => (
                <tr key={q._id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>{q.quotationNo}</td>
                  <td>{q.date}</td>
                  <td>{q.company?.name || 'Constance Halaveli'}</td>
                  <td>{q.custCode}</td>
                  <td>
                    <span className={`badge badge-${q.status.toLowerCase()}`}>{q.status}</span>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>${(q.grandTotal || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {q.status !== 'CONVERTED' && (
                        <button
                          onClick={() => {
                            setPoModalItem(q);
                            setPoNumberInput(q.poNumber || '');
                          }}
                          className="btn-secondary"
                          style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}
                          title="Generate Invoice with PO"
                        >
                          <ArrowRight size={14} /> Create Invoice
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/quotations/view/${q._id}`)}
                        className="btn-secondary"
                        title="View Document"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => navigate(`/quotations/edit/${q._id}`)}
                        className="btn-secondary"
                        title="Edit Quotation"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => printDocumentInIframe(`/print/quotation/${q._id}`)}
                        className="btn-secondary"
                        title="Print PDF"
                      >
                        <Printer size={14} /> Print
                      </button>
                      <button
                        onClick={() => handleDelete(q._id, q.quotationNo)}
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No quotations found. Click "Create Quotation" to start!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Convert to Invoice PO Modal */}
      {poModalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '12px', width: '420px',
            border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ marginTop: 0 }}>Create Invoice from PO</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Quotation: <strong>{poModalItem.quotationNo}</strong>
            </p>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Purchase Order (PO) Number received from client:</label>
              <input
                type="text"
                placeholder="e.g. 55806"
                value={poNumberInput}
                onChange={(e) => setPoNumberInput(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPoModalItem(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreateInvoiceWithPO} className="btn-primary">Generate Invoice</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default QuotationListPage;
