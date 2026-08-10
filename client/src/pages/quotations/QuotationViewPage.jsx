import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QuotationTemplate from '../../components/templates/QuotationTemplate';
import { Printer, ArrowLeft, Edit3 } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';

const QuotationViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotationData, setQuotationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotationData();
  }, [id]);

  const fetchQuotationData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/quotations/${id}`);
      setQuotationData(res.data);
    } catch (error) {
      console.error('Error fetching quotation data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={`Quotation — ${quotationData?.quotationNo || ''}`}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/quotations')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Quotations
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(`/quotations/edit/${id}`)} className="btn-secondary">
            <Edit3 size={16} /> Edit Quotation
          </button>
          <button onClick={() => printDocumentInIframe(`/print/quotation/${id}`)} className="btn-primary">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Workspace Preview */}
      <div style={{
        backgroundColor: '#475569',
        borderRadius: '16px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '80vh',
        overflowY: 'auto'
      }}>
        {loading ? (
          <div style={{ color: '#fff', fontSize: '16px', padding: '40px' }}>Loading Quotation...</div>
        ) : (
          <QuotationTemplate data={quotationData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuotationViewPage;
