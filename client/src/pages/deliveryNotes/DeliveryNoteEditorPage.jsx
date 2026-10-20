import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, Printer } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DeliveryNoteTemplate from '../../components/templates/DeliveryNoteTemplate';
import { printDocumentInIframe } from '../../utils/print';

const today = () => new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
const emptyItem = () => ({ no: '', description: '', quantity: '', remarks: '' });
const releaseTitles = [
  'Dispatch In-Charge',
  'Warehouse Supervisor',
  'Logistics Coordinator',
  'Store Keeper',
  'Operations Executive'
];

const DeliveryNoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [companies, setCompanies] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [invoiceSource, setInvoiceSource] = useState('existing');
  const [data, setData] = useState({
    deliveryNoteNo: '',
    deliveryDate: today(),
    invoice: '',
    invoiceNo: '',
    poNumber: '',
    company: '',
    items: [],
    confirmationText: 'The above goods have been handed over for delivery to the consignee / authorized representative.',
    releasedByName: 'M S D Perera',
    releasedByTitle: 'Dispatch In-Charge'
  });

  useEffect(() => {
    axios.get('/api/companies').then(res => {
      setCompanies(res.data);
      if (!isEdit && res.data.length) setData(prev => ({ ...prev, company: (res.data.find(c => c.isDefault) || res.data[0])._id }));
    }).catch(error => console.error('Error loading companies:', error));
    axios.get('/api/invoices').then(res => setInvoices(res.data.data || res.data)).catch(error => toast.error('Failed to load invoices'));
    if (isEdit) axios.get(`/api/delivery-notes/${id}`).then(res => {
      setInvoiceSource(res.data.invoice?._id || res.data.invoice ? 'existing' : 'manual');
      setData({
        ...res.data,
        invoice: res.data.invoice?._id || res.data.invoice || '',
        company: res.data.company?._id || res.data.company,
        releasedByName: res.data.releasedByName || 'M S D Perera',
        releasedByTitle: res.data.releasedByTitle || ''
      });
    }).catch(error => toast.error('Failed to load delivery note'));
    else axios.get('/api/delivery-notes/next-number').then(res => setData(prev => ({ ...prev, deliveryNoteNo: res.data.nextNo }))).catch(error => toast.error('Failed to generate delivery note number'));
  }, [id]);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const updateItem = (index, key, value) => update('items', data.items.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const loadInvoice = (invoiceId) => {
    if (!invoiceId) {
      update('invoice', '');
      return;
    }
    const invoice = invoices.find(item => item._id === invoiceId);
    if (!invoice) return;
    setData(prev => ({
      ...prev,
      invoice: invoice._id,
      invoiceNo: invoice.invoiceNo || '',
      poNumber: invoice.poNumber || '',
      deliveryDate: invoice.date || prev.deliveryDate,
      company: invoice.company?._id || invoice.company || prev.company,
      items: (invoice.items || []).map((item, index) => ({
        no: item.no || String(index + 1),
        description: [item.name, item.desc].filter(Boolean).join(' - '),
        quantity: item.qty == null ? '' : String(item.qty),
        remarks: ''
      }))
    }));
  };
  const save = async () => {
    if (!data.deliveryNoteNo.trim() || !data.deliveryDate || !data.company) return toast.error('Delivery note number, date, and customer are required.');
    if (!data.items.length) return toast.error('Add at least one delivered item.');
    try {
      setSaving(true);
      const res = isEdit ? await axios.put(`/api/delivery-notes/${id}`, data) : await axios.post('/api/delivery-notes', data);
      toast.success('Delivery note saved successfully');
      navigate(`/delivery-notes/edit/${res.data._id}`);
    } catch (error) { toast.error(error.response?.data?.message || 'Error saving delivery note'); } finally { setSaving(false); }
  };
  const previewData = { ...data, company: companies.find(c => c._id === data.company) || (typeof data.company === 'object' ? data.company : null) };

  return (
    <DashboardLayout title={isEdit ? `Edit Delivery Note ${data.deliveryNoteNo}` : 'Create Delivery Note'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate('/delivery-notes')} className="btn-secondary"><ArrowLeft size={16} /> Back</button>
        <div style={{ display: 'flex', gap: '12px' }}><button onClick={save} disabled={saving} className="btn-primary"><Save size={16} /> {saving ? 'Saving...' : 'Save Delivery Note'}</button>{isEdit && <button onClick={() => printDocumentInIframe(`/print/delivery-note/${id}`)} className="btn-secondary"><Printer size={16} /> Print</button>}</div>
      </div>
      <div className="editor-layout">
        <div className="editor-sidebar">
          <h3>Delivery Note Details</h3>
          <div className="form-group">
            <label>Invoice Source</label>
            <select value={invoiceSource} onChange={e => {
              setInvoiceSource(e.target.value);
              if (e.target.value === 'manual') update('invoice', '');
            }}>
              <option value="existing">Select Existing Invoice</option>
              <option value="manual">Manual Invoice Entry</option>
            </select>
          </div>
          {invoiceSource === 'existing' && <div className="form-group">
            <label>Existing Invoice</label>
            <select value={data.invoice} onChange={e => loadInvoice(e.target.value)}>
              <option value="">Select an invoice from the database</option>
              {invoices.map(invoice => <option key={invoice._id} value={invoice._id}>{invoice.invoiceNo} — {invoice.company?.name || 'Customer'} — PO {invoice.poNumber || '-'}</option>)}
            </select>
            <small>{invoices.length ? 'Invoice, PO, customer, date, and goods will load automatically. You can still edit them below.' : 'No existing invoices are available.'}</small>
          </div>}
          {[['deliveryNoteNo', 'Delivery Note Number'], ['deliveryDate', 'Delivery Date'], ['invoiceNo', 'Invoice Number'], ['poNumber', 'PO Number']].map(([key, label]) => <div className="form-group" key={key}><label>{label}</label><input value={data[key]} onChange={e => update(key, e.target.value)} /></div>)}
          <div className="form-group"><label>Customer Company</label><select value={data.company} onChange={e => update('company', e.target.value)}><option value="">Select company</option>{companies.map(c => <option key={c._id} value={c._id}>{c.name} ({c.custCode})</option>)}</select></div>
          <div className="form-group"><label>Confirmation Text</label><textarea rows="3" value={data.confirmationText} onChange={e => update('confirmationText', e.target.value)} /></div>
          <h3>Released By</h3>
          <div className="form-group"><label>Name</label><input value={data.releasedByName} onChange={e => update('releasedByName', e.target.value)} placeholder="M S D Perera" /></div>
          <div className="form-group"><label>Title</label><select value={data.releasedByTitle} onChange={e => update('releasedByTitle', e.target.value)}><option value="">No title</option>{releaseTitles.map(title => <option key={title} value={title}>{title}</option>)}</select></div>
          <hr />
          <h3>Goods Delivered</h3>
          {data.items.map((item, index) => <div key={index} style={{ border: '1px solid var(--border-color)', padding: '10px', marginBottom: '8px' }}>
            <div className="form-group"><label>Item No.</label><input value={item.no} onChange={e => updateItem(index, 'no', e.target.value)} /></div>
            <div className="form-group"><label>Description of Goods</label><textarea rows="3" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} /></div>
            <div className="form-group"><label>Quantity</label><input value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} /></div>
            <div className="form-group"><label>Remarks</label><input value={item.remarks} onChange={e => updateItem(index, 'remarks', e.target.value)} /></div>
            <button className="btn-danger" onClick={() => update('items', data.items.filter((_, i) => i !== index))}><Trash2 size={14} /> Remove Item</button>
          </div>)}
          <button className="btn-secondary" onClick={() => update('items', [...data.items, emptyItem()])}><Plus size={16} /> Add Item</button>
        </div>
        <div className="editor-preview-workspace"><DeliveryNoteTemplate data={previewData} /></div>
      </div>
    </DashboardLayout>
  );
};
export default DeliveryNoteEditorPage;
