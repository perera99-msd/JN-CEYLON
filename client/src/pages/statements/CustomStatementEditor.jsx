import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatementTemplate from '../../components/templates/StatementTemplate';
import { Plus, Trash2, Save, ArrowLeft, Printer } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';

const CustomStatementEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('Statement of Account');
  const [statementDate, setStatementDate] = useState(
    new Date().toLocaleDateString('en-GB').replace(/\//g, '.')
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [items, setItems] = useState([
    { date: '', invoice: '', desc: '', po: '', status: 'Pending', due: '', total: 0 }
  ]);
  const [pendingTotalBalance, setPendingTotalBalance] = useState('');
  const [accountTotalBalance, setAccountTotalBalance] = useState('');

  useEffect(() => {
    fetchCompanies();
    if (isEdit) {
      fetchCustomStatement();
    }
  }, [id]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/companies');
      setCompanies(res.data);
      if (!selectedCompanyId && res.data.length > 0) {
        setSelectedCompanyId(res.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies list');
    }
  };

  const fetchCustomStatement = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/custom-statements/${id}`);
      const data = res.data;
      setTitle(data.title || 'Statement of Account');
      setStatementDate(data.statementDate || '');
      setSelectedCompanyId(data.company?._id || data.company || '');
      setItems(data.items && data.items.length > 0 ? data.items : []);
      setPendingTotalBalance(data.pendingTotalBalance ?? '');
      setAccountTotalBalance(data.accountTotalBalance ?? '');
    } catch (error) {
      console.error('Error loading custom statement:', error);
      toast.error('Failed to load custom statement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { date: '', invoice: '', desc: '', po: '', status: 'Pending', due: '', total: 0 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      toast.error('Statement must have at least one line item');
      return;
    }
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'total' ? parseFloat(value || 0) : value;
    setItems(updated);
  };

  const calculateAutoSum = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  };

  const autoTotalSum = calculateAutoSum();
  const effectivePending = pendingTotalBalance !== '' ? parseFloat(pendingTotalBalance || 0) : autoTotalSum;
  const effectiveAccount = accountTotalBalance !== '' ? parseFloat(accountTotalBalance || 0) : effectivePending;

  const selectedCompanyObj = companies.find(c => c._id === selectedCompanyId);

  const previewData = {
    company: selectedCompanyObj,
    statementDate,
    items,
    pendingTotalBalance: effectivePending,
    accountTotalBalance: effectiveAccount
  };

  const handleSave = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a customer company!');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        statementDate,
        company: selectedCompanyId,
        items,
        pendingTotalBalance: effectivePending,
        accountTotalBalance: effectiveAccount
      };

      if (isEdit) {
        await axios.put(`/api/custom-statements/${id}`, payload);
        toast.success('Custom Statement updated successfully!');
      } else {
        const res = await axios.post('/api/custom-statements', payload);
        toast.success('Custom Statement created successfully!');
        navigate(`/statements/custom/edit/${res.data._id}`);
      }
    } catch (error) {
      console.error('Error saving statement:', error);
      toast.error(error.response?.data?.message || 'Error saving custom statement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title={isEdit ? 'Edit Custom Account Statement' : 'Create Custom Account Statement'}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/statements')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Statements
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEdit && (
            <button
              type="button"
              onClick={() => printDocumentInIframe(`/print/custom-statement/${id}`)}
              className="btn-secondary"
            >
              <Printer size={16} /> Print PDF
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Statement'}
          </button>
        </div>
      </div>

      {/* Editor Form Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
          Statement Settings & Items
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="form-group">
            <label>Customer Company *</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="filter-select"
              style={{ width: '100%' }}
            >
              <option value="">Select Company...</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Statement Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Statement of Account"
            />
          </div>

          <div className="form-group">
            <label>Statement Date</label>
            <input
              type="text"
              value={statementDate}
              onChange={(e) => setStatementDate(e.target.value)}
              placeholder="DD.MM.YYYY"
            />
          </div>
        </div>

        {/* Dynamic Items Table */}
        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Custom Items List</h4>
        <div className="table-container" style={{ marginBottom: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Date</th>
                <th style={{ width: '15%' }}>Invoice No</th>
                <th>Description</th>
                <th style={{ width: '14%' }}>PO Number</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '12%' }}>Due Date</th>
                <th style={{ width: '12%' }}>Total ($)</th>
                <th style={{ width: '5%', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      placeholder="01.08.2026"
                      value={item.date || ''}
                      onChange={(e) => handleItemChange(idx, 'date', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="111NVO..."
                      value={item.invoice || ''}
                      onChange={(e) => handleItemChange(idx, 'invoice', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Item description..."
                      value={item.desc || ''}
                      onChange={(e) => handleItemChange(idx, 'desc', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="PO-123"
                      value={item.po || ''}
                      onChange={(e) => handleItemChange(idx, 'po', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Pending / Paid"
                      value={item.status || ''}
                      onChange={(e) => handleItemChange(idx, 'status', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Due Date"
                      value={item.due || ''}
                      onChange={(e) => handleItemChange(idx, 'due', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.total ?? 0}
                      onChange={(e) => handleItemChange(idx, 'total', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%', fontWeight: 'bold' }}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Remove Row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={handleAddItem} className="btn-secondary" style={{ marginBottom: '20px' }}>
          <Plus size={16} /> Add Line Item
        </button>

        {/* Custom Balances Override */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label>Pending Total Balance Override ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder={`Auto-calculated ($${autoTotalSum.toFixed(2)})`}
              value={pendingTotalBalance}
              onChange={(e) => setPendingTotalBalance(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Account Total Balance Override ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder={`Auto-calculated ($${autoTotalSum.toFixed(2)})`}
              value={accountTotalBalance}
              onChange={(e) => setAccountTotalBalance(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Live Workspace Preview */}
      <h3 style={{ marginBottom: '12px' }}>Live PDF Preview</h3>
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
          <div style={{ color: '#fff' }}>Loading preview...</div>
        ) : (
          <StatementTemplate data={previewData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomStatementEditor;
