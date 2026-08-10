import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import QuotationTemplate from '../../components/templates/QuotationTemplate';
import '../../styles/document.css';

const PrintQuotation = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasPrinted = useRef(false);

  useEffect(() => {
    let active = true;
    axios.get(`/api/quotations/${id}`)
      .then(res => {
        if (active) setData(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (active) {
          setLoading(false);
          if (!hasPrinted.current) {
            hasPrinted.current = true;
            setTimeout(() => {
              window.print();
            }, 500);
          }
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Quotation Not Found</div>;

  return (
    <div className="print-workspace" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff' }}>
      <QuotationTemplate data={data} />
    </div>
  );
};

export default PrintQuotation;
