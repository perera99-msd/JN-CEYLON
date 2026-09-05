import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InvoiceTemplate from '../../components/templates/InvoiceTemplate';
import { Printer, ArrowLeft, Edit3 } from 'lucide-react';
import { printDocumentInIframe } from '../../utils/print';

const InvoiceViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceData();
  }, [id]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/invoices/${id}`);
      setInvoiceData(res.data);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={`Invoice — ${invoiceData?.invoiceNo || ''}`}>
      {/* Action Header */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/invoices')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Invoices
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(`/invoices/edit/${id}`)} className="btn-secondary">
            <Edit3 size={16} /> Edit Invoice
          </button>
          <button onClick={() => printDocumentInIframe(`/print/invoice/${id}`)} className="btn-primary">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Workspace Preview */}
      <div className="print-workspace" style={{
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
          <div style={{ color: '#fff', fontSize: '16px', padding: '40px' }}>Loading Invoice...</div>
        ) : (
          <InvoiceTemplate data={invoiceData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default InvoiceViewPage;
