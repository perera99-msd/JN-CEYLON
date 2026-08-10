import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QuotationTemplate from '../../components/templates/QuotationTemplate';
import { Plus, Trash2, Save, Printer, Download, ArrowLeft } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';

const QuotationEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    quotationNo: '',
    date: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
    company: '',
    custCode: '- Halav 05',
    preparedBy: 'JN Ceylon',
    status: 'DRAFT',
    poNumber: '',
    items: [],
    terms: {
      price: 'All the above prices are mentioned in USD.',
      delivery: '3 to 4 weeks from order confirmation.',
      term: 'Payment upon order confirmation.',
      validity: '30 Days.'
    }
  });

  // Current item being added/edited
  const [currentItem, setCurrentItem] = useState({
    no: '',
    name: '',
    image: null,
    qty: 1,
    desc: '',
    price: '0.00'
  });
  const [editIndex, setEditIndex] = useState(-1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanies();
    if (isEdit) {
      fetchQuotation(id);
    } else {
      fetchNextNo();
    }
  }, [id]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/companies');
      setCompanies(res.data);
      if (res.data.length > 0 && !formData.company) {
        const defaultComp = res.data.find(c => c.isDefault) || res.data[0];
        setFormData(prev => ({ ...prev, company: defaultComp._id }));
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchNextNo = async () => {
    try {
      const res = await axios.get('/api/quotations/next-number');
      setFormData(prev => ({ ...prev, quotationNo: res.data.nextNo }));
    } catch (error) {
      console.error('Error fetching next quotation no:', error);
    }
  };

  const fetchQuotation = async (quotId) => {
    try {
      const res = await axios.get(`/api/quotations/${quotId}`);
      const q = res.data;
      setFormData({
        _id: q._id,
        quotationNo: q.quotationNo,
        date: q.date,
        company: q.company?._id || q.company,
        custCode: q.custCode,
        preparedBy: q.preparedBy,
        status: q.status,
        poNumber: q.poNumber || '',
        items: q.items || [],
        terms: q.terms || {
          price: 'All the above prices are mentioned in USD.',
          delivery: '3 to 4 weeks from order confirmation.',
          term: 'Payment upon order confirmation.',
          validity: '30 Days.'
        }
      });
    } catch (error) {
      console.error('Error loading quotation:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        setCurrentItem(prev => ({ ...prev, image: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    const qty = parseFloat(currentItem.qty || 0);
    const price = parseFloat(currentItem.price || 0);
    const total = parseFloat((qty * price).toFixed(2));

    const newItem = {
      no: currentItem.no,
      name: currentItem.name,
      image: currentItem.image,
      qty,
      desc: currentItem.desc,
      price: price.toFixed(2),
      total: total.toFixed(2)
    };

    let updatedItems = [...formData.items];
    if (editIndex > -1) {
      updatedItems[editIndex] = newItem;
      setEditIndex(-1);
    } else {
      updatedItems.push(newItem);
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
    setCurrentItem({ no: '', name: '', image: null, qty: 1, desc: '', price: '0.00' });
  };

  const handleEditItem = (index) => {
    setEditIndex(index);
    const item = formData.items[index];
    setCurrentItem({
      no: item.no || '',
      name: item.name || '',
      image: item.image || null,
      qty: item.qty || 1,
      desc: item.desc || '',
      price: item.price || '0.00'
    });
  };

  const handleDeleteItem = (index) => {
    const updated = formData.items.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, items: updated }));
    if (editIndex === index) {
      setEditIndex(-1);
      setCurrentItem({ no: '', name: '', image: null, qty: 1, desc: '', price: '0.00' });
    }
  };

  const handleSave = async () => {
    if (!formData.quotationNo.trim()) {
      toast.error('Quotation number is required!');
      return;
    }
    try {
      setSaving(true);
      if (isEdit) {
        await axios.put(`/api/quotations/${id}`, formData);
        toast.success('Quotation updated successfully!');
      } else {
        const res = await axios.post('/api/quotations', formData);
        toast.success(`Quotation "${res.data.quotationNo}" saved successfully!`);
        navigate(`/quotations/edit/${res.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving quotation');
    } finally {
      setSaving(false);
    }
  };

  const selectedCompanyObj = companies.find(c => c._id === formData.company);

  const previewData = {
    ...formData,
    company: selectedCompanyObj
  };

  return (
    <DashboardLayout title={isEdit ? `Edit Quotation ${formData.quotationNo}` : 'Create New Quotation'}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/quotations')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Quotations
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Quotation'}
          </button>
          {isEdit && (
            <>
              <button onClick={() => printDocumentInIframe(`/print/quotation/${id}`)} className="btn-secondary">
                <Printer size={16} /> Print / Save PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Split Workspace */}
      <div className="editor-layout">
        {/* Left Form Controls Panel */}
        <div className="editor-sidebar">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Document Details</h3>
          
          <div className="form-group">
            <label>Document Number (Unique)</label>
            <input
              type="text"
              value={formData.quotationNo}
              onChange={(e) => setFormData({ ...formData, quotationNo: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Quotation Date</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Customer Company</label>
            <select
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            >
              {companies.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.custCode})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cust. Code</label>
            <input
              type="text"
              value={formData.custCode}
              onChange={(e) => setFormData({ ...formData, custCode: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Prepared By</label>
            <input
              type="text"
              value={formData.preparedBy}
              onChange={(e) => setFormData({ ...formData, preparedBy: e.target.value })}
            />
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '12px 0' }} />

          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            {editIndex > -1 ? 'Edit Line Item' : 'Add Line Item'}
          </h3>

          <div className="form-group">
            <label>Item No</label>
            <input
              type="text"
              value={currentItem.no}
              onChange={(e) => setCurrentItem({ ...currentItem, no: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Product Image (Optional)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ padding: '6px' }} />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={currentItem.qty}
              onChange={(e) => setCurrentItem({ ...currentItem, qty: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={currentItem.desc}
              onChange={(e) => setCurrentItem({ ...currentItem, desc: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Unit Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={currentItem.price}
              onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
            />
          </div>

          <button onClick={handleAddItem} className="btn-primary" style={{ marginTop: '8px' }}>
            <Plus size={16} /> {editIndex > -1 ? 'Update Line Item' : 'Add Line Item'}
          </button>

          <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />

          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Added Items ({formData.items.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {formData.items.map((it, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'var(--bg-main)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'
              }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{it.name || 'Unnamed Item'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Qty: {it.qty} x ${it.price} = ${it.total}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEditItem(idx)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteItem(idx)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Live A4 Preview Panel */}
        <div className="editor-preview-workspace">
          <QuotationTemplate data={previewData} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuotationEditorPage;
