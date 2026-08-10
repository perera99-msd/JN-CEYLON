import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatementTemplate from '../../components/templates/StatementTemplate';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';

const StatementViewPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatementData();
  }, [companyId]);

  const fetchStatementData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/statements/company/${companyId}`);
      setStatementData(res.data);
    } catch (error) {
      console.error('Error fetching statement data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={`Account Statement — ${statementData?.company?.name || ''}`}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/statements')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Statements
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => printDocumentInIframe(`/print/statement/${companyId}`)} className="btn-primary">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Workspace Preview */}
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
          <div style={{ color: '#fff', fontSize: '16px' }}>Loading Account Statement...</div>
        ) : (
          <StatementTemplate data={statementData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StatementViewPage;
