import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FileSpreadsheet, Eye, Printer, Download } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';
import { useNavigate } from 'react-router-dom';

const StatementListPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatementSummaries();
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

  return (
    <DashboardLayout title="Account Statements Overview">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Client Accounts Ledger</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Select a customer company to generate their official Account Statement.
        </p>
      </div>

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
    </DashboardLayout>
  );
};

export default StatementListPage;
