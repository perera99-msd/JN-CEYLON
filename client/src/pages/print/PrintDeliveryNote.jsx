import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DeliveryNoteTemplate from '../../components/templates/DeliveryNoteTemplate';
import '../../styles/document.css';

const PrintDeliveryNote = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasPrinted = useRef(false);

  useEffect(() => {
    let active = true;
    axios.get(`/api/delivery-notes/${id}`).then(res => {
      if (active) setData(res.data);
    }).catch(error => console.error('Error loading delivery note:', error))
      .finally(() => {
        if (active) {
          setLoading(false);
          if (!hasPrinted.current) {
            hasPrinted.current = true;
            setTimeout(() => window.print(), 500);
          }
        }
      });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Delivery Note Not Found</div>;
  return <div className="print-workspace"><DeliveryNoteTemplate data={data} /></div>;
};

export default PrintDeliveryNote;
