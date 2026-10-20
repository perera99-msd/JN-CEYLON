import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Printer, Edit3, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { printDocumentInIframe } from '../../utils/print';
import { useConfirm } from '../../contexts/ConfirmContext';

const DeliveryNoteListPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const confirm = useConfirm();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/delivery-notes', { params: search ? { search } : {} });
      setNotes(res.data);
    } catch (error) {
      toast.error('Failed to load delivery notes');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchNotes(); }, []);

  const remove = async (note) => {
    if (!await confirm({ title: 'Move Delivery Note to Recycle Bin', message: `Move "${note.deliveryNoteNo}" to the Recycle Bin?`, confirmText: 'Move to Bin', type: 'danger' })) return;
    try {
      await axios.delete(`/api/delivery-notes/${note._id}`);
      toast.success('Delivery note moved to Recycle Bin');
      fetchNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete delivery note');
    }
  };

  return (
    <DashboardLayout title="Delivery Notes">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchNotes(); }} className="search-bar-integrated">
          <Search size={16} /><input placeholder="Search delivery note, invoice, PO..." value={search} onChange={e => setSearch(e.target.value)} />
        </form>
        <button onClick={() => navigate('/delivery-notes/new')} className="btn-primary"><Plus size={16} /> Create Delivery Note</button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Delivery Note No.</th><th>Date</th><th>Customer</th><th>Invoice No.</th><th>PO Number</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {!loading && notes.map(note => (
              <tr key={note._id}>
                <td style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>{note.deliveryNoteNo}</td>
                <td>{note.deliveryDate}</td><td>{note.company?.name || '-'}</td><td>{note.invoiceNo || '-'}</td><td>{note.poNumber || '-'}</td>
                <td><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button className="btn-secondary" onClick={() => navigate(`/delivery-notes/view/${note._id}`)}><Eye size={14} /> View</button>
                  <button className="btn-secondary" onClick={() => navigate(`/delivery-notes/edit/${note._id}`)}><Edit3 size={14} /> Edit</button>
                  <button className="btn-secondary" onClick={() => printDocumentInIframe(`/print/delivery-note/${note._id}`)}><Printer size={14} /></button>
                  <button className="btn-danger" onClick={() => remove(note)}><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
            {!loading && notes.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No delivery notes found.</td></tr>}
            {loading && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading delivery notes...</td></tr>}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};
export default DeliveryNoteListPage;
