import React from 'react';
import DocumentHeader from './DocumentHeader';
import { formatMoney } from '../../utils/format';

const QuotationTemplate = ({ data }) => {
  const {
    quotationNo = '11QUOTE323',
    date = '12.03.2026',
    company,
    custCode = '- Halav 05',
    preparedBy = 'JN Ceylon',
    items = [],
    terms
  } = data || {};

  const companyAddress = company?.address ? (
    <>
      {company.name}<br />
      {company.address.line1}<br />
      {company.address.line2}, {company.address.country}
    </>
  ) : (
    <>
      Constance Halaveli<br />
      AlifuAlifu Atoll, Halaveli<br />
      09130, Republic of Maldives
    </>
  );

  const billToHTML = (
    <div className="bill-to-section">
      <div className="bill-label">Bill to -</div>
      <div className="bill-address">{companyAddress}</div>
    </div>
  );

  const subtotal = (items || []).reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

  const safeItems = items || [];
  const pagedItemGroups = [];

  let currentIndex = 0;
  while (currentIndex < safeItems.length) {
    const lookAhead = safeItems.slice(currentIndex, currentIndex + 10);
    const imageCount = lookAhead.filter(item => item.image).length;
    const limit = imageCount > 2 ? 5 : 10;

    pagedItemGroups.push(safeItems.slice(currentIndex, currentIndex + limit));
    currentIndex += limit;
  }

  if (pagedItemGroups.length === 0) {
    pagedItemGroups.push([{}]);
  }

  const totalPages = pagedItemGroups.length;
  const pages = pagedItemGroups.map((pageItems, i) => {
    const isFirstPage = i === 0;
    const isLastPage = i === totalPages - 1;

    return (
      <div className="a4-page" key={i}>
        {isFirstPage ? (
          <>
            <DocumentHeader docType="QUOTATION" />
            <div className="doc-body">
              <div className="meta-row">
                {billToHTML}
                <div className="doc-details-section">
                  <table className="no-border-table">
                    <tbody>
                      <tr>
                        <td>Quotation No</td>
                        <td>- {quotationNo}</td>
                      </tr>
                      <tr>
                        <td>Quotation Date</td>
                        <td>- {date}</td>
                      </tr>
                      <tr>
                        <td>Cust. Code</td>
                        <td>- {custCode}</td>
                      </tr>
                      <tr>
                        <td>Prepared By</td>
                        <td>- {preparedBy}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="greeting-text">
                We thank you for your enquiry and take pleasure in quoting as follows -
              </div>
              <div className="doc-table-wrapper">
                <table className="exact-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>NO</th>
                      <th style={{ width: '32%' }}>PRODUCT</th>
                      <th style={{ width: '8%' }}>QTY</th>
                      <th style={{ width: '25%' }}>DESCRIPTION</th>
                      <th style={{ width: '10%' }}>PRICE</th>
                      <th style={{ width: '15%' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ width: '10%', whiteSpace: 'nowrap' }}>{item.no || ''}</td>
                        <td style={{ width: '32%', textAlign: 'center' }}>
                          {item.name || ''}
                          {item.image && (
                            <>
                              <br />
                              <img src={item.image} alt={item.name} className="item-thumbnail" />
                            </>
                          )}
                        </td>
                        <td style={{ width: '8%', whiteSpace: 'nowrap' }}>{item.qty || ''}</td>
                        <td style={{ width: '25%', textAlign: 'left' }}>{item.desc || ''}</td>
                        <td style={{ width: '10%', whiteSpace: 'nowrap' }}>{formatMoney(item.price)}</td>
                        <td style={{ width: '15%', whiteSpace: 'nowrap' }}>{formatMoney(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isLastPage && (
                <div className="doc-footer-wrapper">
                  <div className="doc-footer">
                    <div className="doc-terms">
                      <table className="doc-terms-table">
                        <tbody>
                          <tr><td>Price</td><td>- {terms?.price || 'All the above prices are mentioned in USD.'}</td></tr>
                          <tr><td>Freight Charges</td><td>- Included in the above prices.</td></tr>
                          <tr><td>Delivery</td><td>- {terms?.delivery || '3 to 4 weeks from order confirmation.'}</td></tr>
                          <tr><td>Term</td><td>- {terms?.term || 'Payment upon order confirmation.'}</td></tr>
                          <tr><td>Validity</td><td>- {terms?.validity || '30 Days.'}</td></tr>
                        </tbody>
                      </table>

                      <div className="payment-heading">Payment Info</div>

                      <table className="doc-terms-table">
                        <tbody>
                          <tr><td>Account Name</td><td>- JN Ceylon Products</td></tr>
                          <tr><td>Acount No</td><td>- 1000572610</td></tr>
                          <tr><td>Bank Name</td><td>- Commercial Bank of Ceylon</td></tr>
                          <tr><td>Swift Code</td><td>- CCEYLKLXXXX</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="doc-totals">
                      <table className="totals-table">
                        <tbody>
                          <tr><td>SUBTOTAL</td><td>{subtotal.toFixed(2)}</td></tr>
                          <tr><td>TAX</td><td></td></tr>
                          <tr><td>DISCOUNT</td><td></td></tr>
                          <tr><td>IVA</td><td></td></tr>
                          <tr><td>TOTAL</td><td>{subtotal.toFixed(2)}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="thank-you-row">
                    <div className="thank-you-text">- THANK YOU FOR YOUR BUSINESS -</div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="doc-body" style={{ paddingTop: '15mm' }}>
            <div className="doc-table-wrapper">
              <table className="exact-table">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>NO</th>
                    <th style={{ width: '32%' }}>PRODUCT</th>
                    <th style={{ width: '8%' }}>QTY</th>
                    <th style={{ width: '25%' }}>DESCRIPTION</th>
                    <th style={{ width: '10%' }}>PRICE</th>
                    <th style={{ width: '15%' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ width: '10%', whiteSpace: 'nowrap' }}>{item.no || ''}</td>
                      <td style={{ width: '32%', textAlign: 'center' }}>
                        {item.name || ''}
                        {item.image && (
                          <>
                            <br />
                            <img src={item.image} alt={item.name} className="item-thumbnail" />
                          </>
                        )}
                      </td>
                      <td style={{ width: '8%', whiteSpace: 'nowrap' }}>{item.qty || ''}</td>
                      <td style={{ width: '25%', textAlign: 'left' }}>{item.desc || ''}</td>
                      <td style={{ width: '10%', whiteSpace: 'nowrap' }}>{formatMoney(item.price)}</td>
                      <td style={{ width: '15%', whiteSpace: 'nowrap' }}>{formatMoney(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isLastPage && (
              <div className="doc-footer-wrapper">
                <div className="doc-footer">
                  <div className="doc-terms">
                    <table className="doc-terms-table">
                      <tbody>
                        <tr><td>Price</td><td>- {terms?.price || 'All the above prices are mentioned in USD.'}</td></tr>
                        <tr><td>Freight Charges</td><td>- Included in the above prices.</td></tr>
                        <tr><td>Delivery</td><td>- {terms?.delivery || '3 to 4 weeks from order confirmation.'}</td></tr>
                        <tr><td>Term</td><td>- {terms?.term || 'Payment upon order confirmation.'}</td></tr>
                        <tr><td>Validity</td><td>- {terms?.validity || '30 Days.'}</td></tr>
                      </tbody>
                    </table>

                    <div className="payment-heading">Payment Info</div>

                    <table className="doc-terms-table">
                      <tbody>
                        <tr><td>Account Name</td><td>- JN Ceylon Products</td></tr>
                        <tr><td>Acount No</td><td>- 1000572610</td></tr>
                        <tr><td>Bank Name</td><td>- Commercial Bank of Ceylon</td></tr>
                        <tr><td>Swift Code</td><td>- CCEYLKLXXXX</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="doc-totals">
                    <table className="totals-table">
                      <tbody>
                        <tr><td>SUBTOTAL</td><td>{subtotal.toFixed(2)}</td></tr>
                        <tr><td>TAX</td><td></td></tr>
                        <tr><td>DISCOUNT</td><td></td></tr>
                        <tr><td>IVA</td><td></td></tr>
                        <tr><td>TOTAL</td><td>{subtotal.toFixed(2)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="thank-you-row">
                  <div className="thank-you-text">- THANK YOU FOR YOUR BUSINESS -</div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="page-number">Page {i + 1} of {totalPages}</div>
      </div>
    );
  });

  return <>{pages}</>;
};

export default QuotationTemplate;
