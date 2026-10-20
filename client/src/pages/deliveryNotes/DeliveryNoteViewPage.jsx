import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Printer } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DeliveryNoteTemplate from '../../components/templates/DeliveryNoteTemplate';
import { printDocumentInIframe } from '../../utils/print';

const DeliveryNoteViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  useEffect(() => { axios.get(`/api/delivery-notes/${id}`).then(res => setData(res.data)).catch(error => console.error('Error loading delivery note:', error)); }, [id]);
  return (
    <DashboardLayout title={`Delivery Note — ${data?.deliveryNoteNo || ''}`}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate('/delivery-notes')} className="btn-secondary"><ArrowLeft size={16} /> Back to Delivery Notes</button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(`/delivery-notes/edit/${id}`)} className="btn-secondary"><Edit3 size={16} /> Edit</button>
          <button onClick={() => printDocumentInIframe(`/print/delivery-note/${id}`)} className="btn-primary"><Printer size={16} /> Print / Save PDF</button>
        </div>
      </div>
      <div className="print-workspace" style={{ backgroundColor: '#475569', borderRadius: '16px', padding: '40px', display: 'flex', justifyContent: 'center' }}>
        {data ? <DeliveryNoteTemplate data={data} /> : <div style={{ color: '#fff' }}>Loading Delivery Note...</div>}
      </div>
    </DashboardLayout>
  );
};
export default DeliveryNoteViewPage;
