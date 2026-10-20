import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatementTemplate from '../../components/templates/StatementTemplate';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Printer,
  FileText,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';
import { formatMoney } from '../../utils/format';

const CustomStatementEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [overdueTotalBalance, setOverdueTotalBalance] = useState('');
  const [totalOutstandingBalance, setTotalOutstandingBalance] = useState('');

  // Invoice selection options
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [showAllCompaniesInvoices, setShowAllCompaniesInvoices] = useState(false);

  // Batch Invoice Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedBatchInvoiceIds, setSelectedBatchInvoiceIds] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

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
      if (!isEdit) {
        const queryCompanyId = searchParams.get('companyId');
        if (queryCompanyId && res.data.some((c) => c._id === queryCompanyId)) {
          setSelectedCompanyId(queryCompanyId);
        } else if (!selectedCompanyId && res.data.length > 0) {
          setSelectedCompanyId(res.data[0]._id);
        }
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
      setPendingTotalBalance(data.pendingTotalBalance !== undefined ? data.pendingTotalBalance : '');
      setOverdueTotalBalance(data.overdueTotalBalance !== undefined ? data.overdueTotalBalance : '');
      setTotalOutstandingBalance(data.totalOutstandingBalance !== undefined ? data.totalOutstandingBalance : '');
    } catch (error) {
      console.error('Error loading custom statement:', error);
      toast.error('Failed to load custom statement');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available invoices whenever company or filter changes
  useEffect(() => {
    if (selectedCompanyId || showAllCompaniesInvoices) {
      fetchInvoices();
    } else {
      setAvailableInvoices([]);
    }
  }, [selectedCompanyId, showAllCompaniesInvoices]);

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const params = {};
      if (!showAllCompaniesInvoices && selectedCompanyId) {
        params.companyId = selectedCompanyId;
      }
      const res = await axios.get('/api/invoices', { params });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setAvailableInvoices(list);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const isPastDueDate = (dueDateStr) => {
    if (!dueDateStr || typeof dueDateStr !== 'string') return false;
    const trimmed = dueDateStr.trim();
    if (trimmed.includes('.')) {
      const parts = trimmed.split('.');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), 23, 59, 59, 999);
        return !isNaN(d.getTime()) && d.getTime() < Date.now();
      }
    }
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), 23, 59, 59, 999);
        return !isNaN(d.getTime()) && d.getTime() < Date.now();
      }
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      return d.getTime() < Date.now();
    }
    return false;
  };

  // Convert an Invoice document into a statement item object
  const convertInvoiceToItem = (inv) => {
    const desc = inv.items && inv.items.length > 0
      ? inv.items.map((i) => i.name).filter(Boolean).join(', ')
      : 'Spare parts supply';

    const isPast = inv.dueDate && isPastDueDate(inv.dueDate);
    const isOverdue = inv.status === 'OVERDUE' || (isPast && inv.status !== 'PAID');

    let displayStatus = 'Pending';
    if (inv.status === 'PAID') displayStatus = 'Paid';
    else if (isOverdue) displayStatus = 'Overdue';
    else if (inv.status === 'PARTIAL') displayStatus = 'Partial';

    return {
      date: inv.date || '',
      invoice: inv.invoiceNo || '',
      desc: desc || 'Spare parts supply',
      po: inv.poNumber || '',
      status: displayStatus,
      due: inv.dueDate || inv.date || '',
      total: parseFloat((inv.grandTotal || 0).toFixed(2))
    };
  };

  // Add a single invoice from the dropdown
  const handleAddSelectedInvoice = () => {
    if (!selectedInvoiceId) {
      toast.error('Please select an invoice from the dropdown first');
      return;
    }
    const inv = availableInvoices.find((i) => i._id === selectedInvoiceId);
    if (!inv) return;

    const newItem = convertInvoiceToItem(inv);

    setItems((prevItems) => {
      const isOnlyBlank = prevItems.length === 1 &&
        !prevItems[0].invoice &&
        !prevItems[0].date &&
        !prevItems[0].desc &&
        !prevItems[0].po &&
        (!prevItems[0].total || prevItems[0].total === 0);

      if (isOnlyBlank) {
        return [newItem];
      }
      return [...prevItems, newItem];
    });

    toast.success(`Invoice "${inv.invoiceNo}" added to statement`);
    setSelectedInvoiceId('');
  };

  // Add multiple selected invoices from batch modal
  const handleAddBatchInvoices = () => {
    if (selectedBatchInvoiceIds.length === 0) {
      toast.error('Please select at least one invoice');
      return;
    }

    const selectedInvs = availableInvoices.filter((i) => selectedBatchInvoiceIds.includes(i._id));
    if (selectedInvs.length === 0) return;

    const newItems = selectedInvs.map(convertInvoiceToItem);

    setItems((prevItems) => {
      const isOnlyBlank = prevItems.length === 1 &&
        !prevItems[0].invoice &&
        !prevItems[0].date &&
        !prevItems[0].desc &&
        !prevItems[0].po &&
        (!prevItems[0].total || prevItems[0].total === 0);

      if (isOnlyBlank) {
        return newItems;
      }
      return [...prevItems, ...newItems];
    });

    toast.success(`Added ${newItems.length} invoice(s) to statement`);
    setIsBatchModalOpen(false);
    setSelectedBatchInvoiceIds([]);
  };

  // Filtered invoices for the batch modal
  const filteredInvoicesForModal = useMemo(() => {
    if (!modalSearchTerm) return availableInvoices;
    const term = modalSearchTerm.toLowerCase();
    return availableInvoices.filter((inv) =>
      (inv.invoiceNo && inv.invoiceNo.toLowerCase().includes(term)) ||
      (inv.poNumber && inv.poNumber.toLowerCase().includes(term)) ||
      (inv.items && inv.items.some((it) => it.name && it.name.toLowerCase().includes(term)))
    );
  }, [availableInvoices, modalSearchTerm]);

  const toggleBatchInvoice = (invId) => {
    setSelectedBatchInvoiceIds((prev) =>
      prev.includes(invId) ? prev.filter((id) => id !== invId) : [...prev, invId]
    );
  };

  const handleSelectAllBatch = () => {
    const filteredIds = filteredInvoicesForModal.map((i) => i._id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedBatchInvoiceIds.includes(id));
    if (allSelected) {
      setSelectedBatchInvoiceIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedBatchInvoiceIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Fully customizable item management
  const handleAddBlankItem = () => {
    setItems((prev) => [
      ...prev,
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

  const handleClearAllItems = () => {
    setItems([{ date: '', invoice: '', desc: '', po: '', status: 'Pending', due: '', total: 0 }]);
    toast('Items reset to a blank row', { icon: '🧹' });
  };

  const handleMoveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'total' ? parseFloat(value || 0) : value;
    setItems(updated);
  };

  const calculatePendingSum = () => {
    return items.reduce((sum, item) => {
      const s = (item.status || '').toString().trim().toLowerCase();
      if (s === 'pending') {
        return sum + (parseFloat(item.total) || 0);
      }
      return sum;
    }, 0);
  };

  const calculateOverdueSum = () => {
    return items.reduce((sum, item) => {
      const s = (item.status || '').toString().trim().toLowerCase();
      if (s === 'overdue') {
        return sum + (parseFloat(item.total) || 0);
      }
      return sum;
    }, 0);
  };

  const autoPendingSum = calculatePendingSum();
  const autoOverdueSum = calculateOverdueSum();
  const autoOutstandingSum = autoPendingSum + autoOverdueSum;

  const effectivePending = pendingTotalBalance !== '' ? parseFloat(pendingTotalBalance || 0) : autoPendingSum;
  const effectiveOverdue = overdueTotalBalance !== '' ? parseFloat(overdueTotalBalance || 0) : autoOverdueSum;
  const effectiveOutstanding = totalOutstandingBalance !== '' ? parseFloat(totalOutstandingBalance || 0) : (effectivePending + effectiveOverdue);

  const selectedCompanyObj = companies.find((c) => c._id === selectedCompanyId);

  const previewData = {
    company: selectedCompanyObj,
    statementDate,
    items,
    pendingTotalBalance: autoPendingSum,
    overdueTotalBalance: autoOverdueSum,
    totalOutstandingBalance: autoOutstandingSum,
    accountTotalBalance: autoOutstandingSum
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
        overdueTotalBalance: effectiveOverdue,
        totalOutstandingBalance: effectiveOutstanding,
        accountTotalBalance: effectiveOutstanding
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
              Statement Settings & Template Builder
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
              Choose an existing invoice from the dropdown to add it directly, or create completely custom line items.
            </p>
          </div>
        </div>

        {/* Top Settings: Customer, Title, Date */}
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

        {/* SECTION 1: Select Invoice from Dropdown & Add into Custom Template */}
        <div style={{
          backgroundColor: 'var(--bg-main, #f8fafc)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '10px',
          padding: '18px 20px',
          marginBottom: '26px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(244, 122, 32, 0.1)',
                color: 'var(--palette-orange, #f47a20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                  Add from Existing Invoices
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                  ({availableInvoices.length} invoice{availableInvoices.length === 1 ? '' : 's'} available)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={showAllCompaniesInvoices}
                  onChange={(e) => setShowAllCompaniesInvoices(e.target.checked)}
                />
                Show all companies' invoices
              </label>

              {availableInvoices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(true)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Layers size={15} /> Batch Select Invoices
                </button>
              )}
            </div>
          </div>

          {/* Invoice Dropdown + Add Button */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className="filter-select"
                style={{ width: '100%', fontSize: '13px', padding: '8px 12px' }}
                disabled={loadingInvoices || availableInvoices.length === 0}
              >
                <option value="">
                  {loadingInvoices
                    ? 'Loading available invoices...'
                    : availableInvoices.length === 0
                      ? (selectedCompanyId ? 'No invoices found for this company' : 'Select a company above first')
                      : '-- Select an Invoice from Dropdown to Add into Template --'}
                </option>
                {availableInvoices.map((inv) => {
                  const isAlreadyAdded = items.some(
                    (item) => item.invoice && item.invoice.toLowerCase() === (inv.invoiceNo || '').toLowerCase()
                  );
                  return (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNo} | PO: {inv.poNumber || 'N/A'} | Total: ${formatMoney(inv.grandTotal)} | Due: {inv.dueDate || inv.date || 'N/A'} [{inv.status}]{isAlreadyAdded ? ' (Already in statement)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddSelectedInvoice}
              disabled={!selectedInvoiceId}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add to Statement
            </button>
          </div>
        </div>

        {/* SECTION 2: Dynamic & Fully Customizable Items Table */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
              Statement Items ({items.length})
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Fully customizable: you can edit any cell directly, reorder rows, or add blank items.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClearAllItems}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444' }}
              title="Reset items table to a single blank row"
            >
              <RotateCcw size={14} /> Clear All
            </button>
            <button
              type="button"
              onClick={handleAddBlankItem}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <Plus size={15} /> Add Blank Custom Row
            </button>
          </div>
        </div>

        <div className="table-container" style={{ marginBottom: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ width: '11%' }}>Date</th>
                <th style={{ width: '14%' }}>Invoice No</th>
                <th>Description</th>
                <th style={{ width: '13%' }}>PO Number</th>
                <th style={{ width: '11%' }}>Status</th>
                <th style={{ width: '11%' }}>Due Date</th>
                <th style={{ width: '12%' }}>Total ($)</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="DD.MM.YYYY"
                      value={item.date || ''}
                      onChange={(e) => handleItemChange(idx, 'date', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="INV-..."
                      value={item.invoice || ''}
                      onChange={(e) => handleItemChange(idx, 'invoice', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%', fontWeight: '600' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Item description or spare parts summary..."
                      value={item.desc || ''}
                      onChange={(e) => handleItemChange(idx, 'desc', e.target.value)}
                      style={{ padding: '6px 8px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="PO-..."
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(idx, -1)}
                        disabled={idx === 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: idx === 0 ? '#cbd5e1' : 'var(--text-secondary)',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          padding: '2px'
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(idx, 1)}
                        disabled={idx === items.length - 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: idx === items.length - 1 ? '#cbd5e1' : 'var(--text-secondary)',
                          cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                          padding: '2px'
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="Remove Row"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons below table */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <button type="button" onClick={handleAddBlankItem} className="btn-secondary">
            <Plus size={16} /> Add Custom Line Item
          </button>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Pending: <strong style={{ color: 'var(--text-primary)' }}>${formatMoney(autoPendingSum)}</strong> | Overdue: <strong style={{ color: 'var(--text-primary)' }}>${formatMoney(autoOverdueSum)}</strong> | Outstanding: <strong style={{ color: 'var(--text-primary)' }}>${formatMoney(autoOutstandingSum)}</strong>
          </div>
        </div>

        {/* Custom Balances Override */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label>Pending Total Balance Override ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder={`Auto-calculated ($${formatMoney(autoPendingSum)})`}
              value={pendingTotalBalance}
              onChange={(e) => setPendingTotalBalance(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Leave blank to auto-calculate from Pending items (${formatMoney(autoPendingSum)})
            </span>
          </div>

          <div className="form-group">
            <label>Overdue Total Balance Override ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder={`Auto-calculated ($${formatMoney(autoOverdueSum)})`}
              value={overdueTotalBalance}
              onChange={(e) => setOverdueTotalBalance(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Leave blank to auto-calculate from Overdue items (${formatMoney(autoOverdueSum)})
            </span>
          </div>

          <div className="form-group">
            <label>Total Outstanding Balance Override ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder={`Auto-calculated ($${formatMoney(effectivePending + effectiveOverdue)})`}
              value={totalOutstandingBalance}
              onChange={(e) => setTotalOutstandingBalance(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Leave blank to auto-calculate Pending + Overdue (${formatMoney(effectivePending + effectiveOverdue)})
            </span>
          </div>
        </div>
      </div>

      {/* Live Workspace Preview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Live PDF Preview</h3>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Updated automatically as you edit custom items above
        </span>
      </div>

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
          <StatementTemplate
            data={previewData}
          />
        )}
      </div>

      {/* Batch Invoices Modal */}
      {isBatchModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsBatchModalOpen(false)}>
          <div
            className="modal-card-custom"
            style={{ maxWidth: '780px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '7px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(244, 122, 32, 0.1)',
                  color: 'var(--palette-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Layers size={18} />
                </div>
                <h3 className="modal-title-custom">
                  Batch Select Invoices to Add
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-custom">
              {/* Search filter in modal */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search by Invoice No, PO, items..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    style={{ paddingLeft: '32px', width: '100%' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllBatch}
                  className="btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  {filteredInvoicesForModal.length > 0 &&
                  filteredInvoicesForModal.every((i) => selectedBatchInvoiceIds.includes(i._id))
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              {/* Invoices list */}
              <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                {filteredInvoicesForModal.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No invoices match your search or company filter.
                  </div>
                ) : (
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}></th>
                        <th>Invoice No</th>
                        <th>Date</th>
                        <th>PO Number</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Total ($)</th>
                        <th style={{ textAlign: 'right' }}>Balance Due ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoicesForModal.map((inv) => {
                        const isSelected = selectedBatchInvoiceIds.includes(inv._id);
                        const isAlreadyAdded = items.some(
                          (item) => item.invoice && item.invoice.toLowerCase() === (inv.invoiceNo || '').toLowerCase()
                        );
                        return (
                          <tr
                            key={inv._id}
                            onClick={() => toggleBatchInvoice(inv._id)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'rgba(244, 122, 32, 0.08)' : undefined
                            }}
                          >
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleBatchInvoice(inv._id)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ fontWeight: '600', color: 'var(--accent-orange)' }}>
                              {inv.invoiceNo}
                              {isAlreadyAdded && (
                                <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                                  (added)
                                </span>
                              )}
                            </td>
                            <td>{inv.date}</td>
                            <td>{inv.poNumber || 'N/A'}</td>
                            <td>
                              <span className={`badge badge-${inv.status?.toLowerCase() || 'pending'}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              ${formatMoney(inv.grandTotal)}
                            </td>
                            <td style={{ textAlign: 'right', color: inv.balanceDue > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                              ${formatMoney(inv.balanceDue)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="modal-footer-custom">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBatchInvoices}
                disabled={selectedBatchInvoiceIds.length === 0}
                className="btn-primary"
              >
                <Plus size={16} /> Add Selected ({selectedBatchInvoiceIds.length}) to Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomStatementEditor;
