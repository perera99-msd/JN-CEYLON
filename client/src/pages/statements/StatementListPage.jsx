import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Eye, Printer, Plus, Edit3, Trash2, FileSpreadsheet } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../contexts/ConfirmContext';

const StatementListPage = () => {
  const [activeTab, setActiveTab] = useState('AUTO'); // 'AUTO' or 'CUSTOM'
  const [summaries, setSummaries] = useState([]);
  const [customStatements, setCustomStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    fetchStatementSummaries();
    fetchCustomStatements();
  }, []);

  const fetchStatementSummaries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/statements/overview');
      setSummaries(res.data);
    } catch (error) {
      console.error('Error fetching statement overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomStatements = async () => {
    try {
      const res = await axios.get('/api/custom-statements');
      setCustomStatements(res.data);
    } catch (error) {
      console.error('Error fetching custom statements:', error);
    }
  };

  const handleDeleteCustomStatement = async (id, title) => {
    const isConfirmed = await confirm({
      title: 'Move Custom Statement to Recycle Bin',
      message: `Are you sure you want to delete "${title || 'Custom Statement'}"? It will be moved to the Recycle Bin.`,
      confirmText: 'Move to Recycle Bin',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await axios.delete(`/api/custom-statements/${id}`);
        toast.success('Custom Statement moved to Recycle Bin');
        fetchCustomStatements();
      } catch (error) {
        toast.error('Error deleting custom statement');
      }
    }
  };

  return (
    <DashboardLayout title="Account Statements">
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Account Statements</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            View auto-generated customer ledgers or build fully custom statements.
          </p>
        </div>

        {activeTab === 'CUSTOM' && (
          <button onClick={() => navigate('/statements/custom/new')} className="btn-primary">
            <Plus size={16} /> Create Custom Statement
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('AUTO')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'AUTO' ? '3px solid var(--palette-orange)' : '3px solid transparent',
            color: activeTab === 'AUTO' ? 'var(--palette-orange)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'AUTO' ? 'bold' : '600',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          Auto-Generated Ledgers
        </button>
        <button
          onClick={() => setActiveTab('CUSTOM')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'CUSTOM' ? '3px solid var(--palette-orange)' : '3px solid transparent',
            color: activeTab === 'CUSTOM' ? 'var(--palette-orange)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'CUSTOM' ? 'bold' : '600',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          Custom Statements ({customStatements.length})
        </button>
      </div>

      {/* TAB 1: Auto-Generated Ledgers */}
      {activeTab === 'AUTO' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {summaries.map((item) => (
            <div key={item.company._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--accent-orange)' }}>
                    {item.company.name}
                  </h3>
                  <span className="badge badge-pending">
                    {item.pendingCount} Pending Invoices
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Customer Code: <strong>{item.company.custCode}</strong><br />
                  Address: {item.company.address?.line1}, {item.company.address?.country}
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Outstanding Balance</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', color: item.pendingBalance > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                    ${item.pendingBalance.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => navigate(`/statements/view/${item.company._id}`)}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Eye size={16} /> View Statement
                </button>
                <button
                  onClick={() => printDocumentInIframe(`/print/statement/${item.company._id}`)}
                  className="btn-secondary"
                  title="Print Statement A4"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Custom Statements */}
      {activeTab === 'CUSTOM' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title / Reference</th>
                <th>Customer Company</th>
                <th>Statement Date</th>
                <th>Items Count</th>
                <th>Pending Balance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customStatements.length > 0 ? (
                customStatements.map((stmt) => (
                  <tr key={stmt._id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>
                      {stmt.title || 'Statement of Account'}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {stmt.company?.name || 'N/A'}
                    </td>
                    <td>{stmt.statementDate}</td>
                    <td>{stmt.items?.length || 0} row(s)</td>
                    <td style={{ fontWeight: 'bold' }}>
                      ${(stmt.pendingTotalBalance || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => navigate(`/statements/custom/edit/${stmt._id}`)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                          title="Edit Custom Statement"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => printDocumentInIframe(`/print/custom-statement/${stmt._id}`)}
                          className="btn-primary"
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                          title="Print A4 PDF"
                        >
                          <Printer size={14} /> Print
                        </button>
                        <button
                          onClick={() => handleDeleteCustomStatement(stmt._id, stmt.title)}
                          className="btn-danger"
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                          title="Delete Custom Statement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No custom statements found. Click <strong>"Create Custom Statement"</strong> above to build one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StatementListPage;
