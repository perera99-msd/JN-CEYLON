import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Trash2, RefreshCw, AlertTriangle, Search, Filter } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext';

const RecycleBinPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const confirm = useConfirm();

  useEffect(() => {
    fetchRecycleBin();
  }, []);

  const fetchRecycleBin = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/recycle-bin');
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching recycle bin:', error);
      toast.error('Failed to load Recycle Bin items');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type, id, identifier) => {
    const isConfirmed = await confirm({
      title: 'Restore Item',
      message: `Are you sure you want to restore "${identifier}" back to active status?`,
      confirmText: 'Restore Item',
      type: 'primary'
    });

    if (isConfirmed) {
      try {
        await axios.post(`/api/recycle-bin/restore/${type}/${id}`);
        toast.success(`"${identifier}" restored successfully!`);
        fetchRecycleBin();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error restoring item');
      }
    }
  };

  const handlePermanentDelete = async (type, id, identifier) => {
    const isConfirmed = await confirm({
      title: 'Permanently Delete Item',
      message: `CAUTION: Are you sure you want to permanently delete "${identifier}"? This cannot be undone or recovered!`,
      confirmText: 'Permanently Delete',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await axios.delete(`/api/recycle-bin/permanent/${type}/${id}`);
        toast.success(`"${identifier}" permanently deleted.`);
        fetchRecycleBin();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting item permanently');
      }
    }
  };

  const calculateDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 30;
    const deletedDate = new Date(deletedAt);
    const expireDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    const now = new Date();
    const diffTime = expireDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filteredItems = items.filter(item => {
    const matchesType = typeFilter === 'ALL' || item.itemType === typeFilter;
    const matchesSearch = !search || 
      item.identifier.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <DashboardLayout title="Recycle Bin">
      {/* Top Header info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Recycle Bin</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Deleted items are automatically and permanently erased after 30 days. Numbers remain locked to prevent duplicate numbers.
          </p>
        </div>

        <button onClick={fetchRecycleBin} className="btn-secondary" title="Refresh list">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '8px' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search deleted items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary">
            <Search size={16} /> Search
          </button>
        </form>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Types</option>
          <option value="QUOTATION">Quotations</option>
          <option value="INVOICE">Invoices</option>
          <option value="COMPANY">Companies</option>
          <option value="PAYMENT">Payments</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item Type</th>
              <th>Document / Name</th>
              <th>Details</th>
              <th>Date Deleted</th>
              <th>Auto-Delete In</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const daysRemaining = calculateDaysRemaining(item.deletedAt);
                return (
                  <tr key={`${item.itemType}-${item._id}`}>
                    <td>
                      <span className={`badge badge-${item.itemType.toLowerCase()}`} style={{
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                      }}>
                        {item.itemType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>
                      {item.title}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {item.subtitle}
                    </td>
                    <td>
                      {item.deletedAt ? new Date(item.deletedAt).toLocaleString('en-GB') : 'Recently'}
                    </td>
                    <td>
                      <span style={{
                        color: daysRemaining <= 5 ? '#ef4444' : 'var(--text-main)',
                        fontWeight: daysRemaining <= 5 ? 'bold' : 'normal'
                      }}>
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleRestore(item.itemType, item._id, item.identifier)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                          title="Restore item"
                        >
                          <RefreshCw size={14} /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.itemType, item._id, item.identifier)}
                          className="btn-danger"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                          title="Delete permanently"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  {loading ? 'Loading Recycle Bin...' : 'Recycle Bin is empty! No deleted items found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default RecycleBinPage;
