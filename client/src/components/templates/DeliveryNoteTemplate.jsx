import React from 'react';
import DocumentHeader from './DocumentHeader';

const DeliveryNoteTemplate = ({ data }) => {
  const {
    deliveryNoteNo = 'DN-111NVO365',
    deliveryDate = '',
    invoiceNo = '',
    poNumber = '',
    company,
    items = [],
    confirmationText = 'The above goods have been handed over for delivery to the consignee / authorized representative.',
    releasedByName = 'M S D Perera',
    releasedByTitle = 'Dispatch In-Charge'
  } = data || {};
  const address = company?.address;
  const companyAddress = company ? (
    <>{company.name}<br />{address?.line1}<br />{address?.line2}, {address?.country}</>
  ) : 'Customer name and address';
  const itemGroups = items.length
    ? Array.from({ length: Math.ceil(items.length / 10) }, (_, index) => items.slice(index * 10, index * 10 + 10))
    : [[{}]];
  const totalPages = itemGroups.length;

  return itemGroups.map((rows, pageIndex) => {
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === totalPages - 1;

    return (
      <div className="a4-page delivery-note-page" key={pageIndex}>
        {isFirstPage && <DocumentHeader docType="DELIVERY NOTE" />}
        <div className={`doc-body delivery-note-body ${!isFirstPage ? 'delivery-note-continuation' : ''}`}>
          {isFirstPage && <div className="delivery-note-meta">
            <div className="delivery-to"><strong>Deliver To:</strong><div>{companyAddress}</div></div>
            <table className="delivery-meta-table">
              <tbody>
                <tr><td>Delivery Note No.</td><td>{deliveryNoteNo}</td></tr>
                <tr><td>Delivery Date</td><td>{deliveryDate}</td></tr>
                <tr><td>Invoice No.</td><td>{invoiceNo}</td></tr>
                <tr><td>PO Number</td><td>{poNumber}</td></tr>
              </tbody>
            </table>
          </div>}

          <h3 className="delivery-section-title">Goods Delivered{!isFirstPage && ' (Continued)'}</h3>
          <table className="exact-table delivery-items-table">
            <thead><tr><th style={{ width: '8%' }}>No.</th><th style={{ width: '54%' }}>Description of Goods</th><th style={{ width: '16%' }}>Quantity</th><th style={{ width: '22%' }}>Remarks</th></tr></thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={index}>
                  <td>{item.no || (pageIndex * 10) + index + 1}</td>
                  <td className="delivery-description">{item.description || ''}</td>
                  <td>{item.quantity || ''}</td>
                  <td>{item.remarks || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLastPage && <>
            <div className="delivery-confirmation">
              <h3 className="delivery-section-title">Delivery Confirmation</h3>
              <p>{confirmationText}</p>
            </div>

            <div className="signature-grid">
              <div className="signature-block">
                <div className="signature-role">Released By</div>
                <div className="signature-write-line" />
                <span className="signature-name">{releasedByName || '___________________________'}</span>
                {releasedByTitle && <span className="signature-title">{releasedByTitle}</span>}
                <div className="date-line">Date: <i /></div>
              </div>
              <div className="signature-block">
                <div className="signature-role">Received By</div>
                <div className="signature-write-line" />
                <span className="signature-name">___________________________</span>
                <span className="signature-title">Name / Title</span>
                <span className="signature-stamp">Company Stamp</span>
                <div className="date-line">Date: <i /></div>
              </div>
            </div>
            <div className="delivery-thank-you">Thank you for your business!</div>
          </>}
        </div>
        <div className="page-number">Page {pageIndex + 1} of {totalPages}</div>
      </div>
    );
  });
};

export default DeliveryNoteTemplate;
