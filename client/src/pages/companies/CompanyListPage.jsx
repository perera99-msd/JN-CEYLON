import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, Edit3, Trash2, CheckCircle } from 'lucide-react';

const CompanyListPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    custCode: '',
    address: {
      line1: 'AlifuAlifu Atoll, Halaveli',
      line2: '09130',
      country: 'Republic of Maldives'
    },
    contactEmail: '',
    contactPhone: '',
    isDefault: false
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/companies');
      setCompanies(res.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      custCode: '',
      address: {
        line1: '',
        line2: '',
        country: 'Republic of Maldives'
      },
      contactEmail: '',
      contactPhone: '',
      isDefault: false
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingId(comp._id);
    setFormData({
      name: comp.name,
      custCode: comp.custCode || '',
      address: comp.address || { line1: '', line2: '', country: 'Republic of Maldives' },
      contactEmail: comp.contactEmail || '',
      contactPhone: comp.contactPhone || '',
      isDefault: comp.isDefault || false
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Company name is required');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`/api/companies/${editingId}`, formData);
      } else {
        await axios.post('/api/companies', formData);
      }
      setModalOpen(false);
      fetchCompanies();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving company');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete company "${name}"?`)) {
      try {
        await axios.delete(`/api/companies/${id}`);
        fetchCompanies();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting company');
      }
    }
  };

  return (
    <DashboardLayout title="Client Companies Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Customer Companies</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage client profiles for automatic document population.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Cust. Code</th>
              <th>Address</th>
              <th>Contact Email</th>
              <th>Default</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>{c.name}</td>
                <td style={{ fontWeight: 'bold' }}>{c.custCode}</td>
                <td>{c.address?.line1}, {c.address?.country}</td>
                <td>{c.contactEmail || '-'}</td>
                <td>
                  {c.isDefault ? (
                    <span className="badge badge-converted" style={{ display: 'inline-flex', gap: '4px' }}>
                      <CheckCircle size={12} /> Default
                    </span>
                  ) : '-'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleOpenEdit(c)} className="btn-secondary">
                      <Edit3 size={14} /> Edit
                    </button>
                    {!c.isDefault && (
                      <button onClick={() => handleDelete(c._id, c.name)} className="btn-danger">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '12px', width: '460px',
            border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Company' : 'Add New Company'}</h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Constance Halaveli"
                  required
                />
              </div>

              <div className="form-group">
                <label>Customer Code</label>
                <input
                  type="text"
                  value={formData.custCode}
                  onChange={(e) => setFormData({ ...formData, custCode: e.target.value })}
                  placeholder="e.g. Halav 05"
                  required
                />
              </div>

              <div className="form-group">
                <label>Address Line 1</label>
                <input
                  type="text"
                  value={formData.address.line1}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, line1: e.target.value }
                  })}
                  placeholder="e.g. AlifuAlifu Atoll, Halaveli"
                />
              </div>

              <div className="form-group">
                <label>Address Line 2 (Postal / City)</label>
                <input
                  type="text"
                  value={formData.address.line2}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, line2: e.target.value }
                  })}
                  placeholder="e.g. 09130"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value }
                  })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CompanyListPage;
