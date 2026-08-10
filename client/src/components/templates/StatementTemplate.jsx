import React from 'react';
import DocumentHeader from './DocumentHeader';

const StatementTemplate = ({ data }) => {
  const {
    company,
    statementDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
    items = [],
    pendingTotalBalance,
    accountTotalBalance
  } = data || {};

  const itemsTotalSum = (items || []).reduce((sum, item) => sum + parseFloat(item.total || item.balanceDue || 0), 0);
  const pendingDisplay = pendingTotalBalance !== undefined ? pendingTotalBalance : itemsTotalSum;
  const accountDisplay = accountTotalBalance !== undefined ? accountTotalBalance : itemsTotalSum;

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil((items || []).length / itemsPerPage));

  const companyAddressName = company?.name || 'Constance Halaveli.';
  const companyLine1 = company?.address?.line1 || 'Alifu Alifu Atoll, Halaveli 09130,';
  const companyLine2 = company?.address?.country || 'Republic of Maldives.';

  const statementBillToHTML = (
    <div className="bill-to-section" style={{ flexDirection: 'column' }}>
      <div className="bill-label" style={{ fontSize: '16px', marginBottom: '5px' }}>Bill To:</div>
      <div className="bill-address" style={{ fontSize: '14px' }}>
        {companyAddressName}<br />
        {companyLine1}<br />
        {companyLine2}
      </div>
    </div>
  );

  const pages = [];

  for (let i = 0; i < totalPages; i++) {
    const isFirstPage = i === 0;
    const isLastPage = i === totalPages - 1;

    let pageItems = (items || []).slice(i * itemsPerPage, (i + 1) * itemsPerPage);

    // Forces minimum 5 rows for aesthetics and structural consistency (same as template.html line 768)
    while (pageItems.length < 5) {
      pageItems.push({});
    }

    pages.push(
      <div className="a4-page" key={i}>
        {isFirstPage ? (
          <>
            <DocumentHeader docType="STATEMENT" />
            <div className="doc-body">
              <div className="meta-row" style={{ marginBottom: '25px', alignItems: 'flex-start' }}>
                {statementBillToHTML}
                <div style={{ width: '48%' }}>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
                    Statement of Account
                  </div>
                  <table className="exact-table" style={{ width: '100%', marginLeft: 'auto' }}>
                    <tbody>
                      <tr>
                        <td style={{ background: '#fff', color: '#000', textAlign: 'center', fontWeight: 'bold', width: '55%' }}>
                          Total Balance
                        </td>
                        <td style={{ background: '#fff', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                          $ {accountDisplay.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ background: '#fff', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                          Payment Due Date
                        </td>
                        <td style={{ background: '#fff', color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                          {statementDate}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-table-wrapper statement-wrapper" style={{ marginBottom: isLastPage ? '0' : '10px' }}>
                <table className="exact-table statement-table" style={{ borderBottom: isLastPage ? 'none' : undefined }}>
                  <thead>
                    <tr>
                      <th style={{ width: '12%' }}>Date</th>
                      <th style={{ width: '14%' }}>Invoice</th>
                      <th style={{ width: '30%' }}>Description</th>
                      <th style={{ width: '14%' }}>P/O Number</th>
                      <th style={{ width: '10%' }}>Status</th>
                      <th style={{ width: '10%' }}>Due</th>
                      <th style={{ width: '10%' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ width: '12%', whiteSpace: 'nowrap' }}>{item.date || ''}</td>
                        <td style={{ width: '14%' }}>{item.invoice || ''}</td>
                        <td style={{ width: '30%', textAlign: 'center' }}>{item.desc || ''}</td>
                        <td style={{ width: '14%' }}>{item.po || ''}</td>
                        <td style={{ width: '10%' }}>{item.status || ''}</td>
                        <td style={{ width: '10%', whiteSpace: 'nowrap' }}>{item.due || ''}</td>
                        <td style={{ width: '10%', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {item.total !== undefined && item.total !== '' ? `$ ${typeof item.total === 'number' ? item.total.toFixed(2) : item.total}` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isLastPage && (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', tableLayout: 'fixed', marginBottom: '15px' }}>
                    <tbody>
                      <tr style={{ height: '28px' }}>
                        <td style={{ width: '90%', background: '#000', color: '#fff', textAlign: 'right', paddingRight: '15px', border: '1px solid #000', fontSize: '13px', fontWeight: 'bold' }}>
                          Pending Total Balance
                        </td>
                        <td style={{ width: '10%', background: '#000', color: '#fff', textAlign: 'center', fontWeight: 'bold', border: '1px solid #000', fontSize: '14px', whiteSpace: 'nowrap' }}>
                          $ {pendingDisplay.toFixed(2)}
                        </td>
                      </tr>
                      <tr style={{ height: '28px' }}>
                        <td style={{ width: '90%', background: '#000', color: '#fff', textAlign: 'right', paddingRight: '15px', border: '1px solid #000', fontSize: '13px', fontWeight: 'bold' }}>
                          Account Total Balance
                        </td>
                        <td style={{ width: '10%', background: '#000', color: '#fff', textAlign: 'center', fontWeight: 'bold', border: '1px solid #000', fontSize: '14px', whiteSpace: 'nowrap' }}>
                          $ {accountDisplay.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginTop: '15px', lineHeight: '1.6' }}>
                    Your account balance is <strong>${pendingDisplay.toFixed(2)}</strong> Please make your payment to cover the balance by the due date.<br />
                    Make all checks payable to Ceylon Engineers<br />
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Thank you for your business!</span><br />
                    <span style={{ fontSize: '13px', fontWeight: 'normal' }}>
                      69/1 Peter Mendis Road, Negombo, Sri Lanka, 11500<br />
                      Tel: +94770043258 E-mail: jnceylonproducts@gmail.com
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="doc-body" style={{ paddingTop: '15mm' }}>
            <div className="doc-table-wrapper statement-wrapper" style={{ marginBottom: isLastPage ? '0' : '10px' }}>
              <table className="exact-table statement-table" style={{ borderBottom: isLastPage ? 'none' : undefined }}>
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Date</th>
                    <th style={{ width: '14%' }}>Invoice</th>
                    <th style={{ width: '30%' }}>Description</th>
                    <th style={{ width: '14%' }}>P/O Number</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '10%' }}>Due</th>
                    <th style={{ width: '10%' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ width: '12%', whiteSpace: 'nowrap' }}>{item.date || ''}</td>
                      <td style={{ width: '14%' }}>{item.invoice || ''}</td>
                      <td style={{ width: '30%', textAlign: 'center' }}>{item.desc || ''}</td>
                      <td style={{ width: '14%' }}>{item.po || ''}</td>
                      <td style={{ width: '10%' }}>{item.status || ''}</td>
                      <td style={{ width: '10%', whiteSpace: 'nowrap' }}>{item.due || ''}</td>
                      <td style={{ width: '10%', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {item.total !== undefined && item.total !== '' ? `$ ${typeof item.total === 'number' ? item.total.toFixed(2) : item.total}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isLastPage && (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', tableLayout: 'fixed', marginBottom: '15px' }}>
                  <tbody>
                    <tr style={{ height: '28px' }}>
                      <td style={{ width: '90%', background: '#000', color: '#fff', textAlign: 'right', paddingRight: '15px', border: '1px solid #000', fontSize: '13px', fontWeight: 'bold' }}>
                        Pending Total Balance
                      </td>
                      <td style={{ width: '10%', background: '#000', color: '#fff', textAlign: 'center', fontWeight: 'bold', border: '1px solid #000', fontSize: '14px', whiteSpace: 'nowrap' }}>
                        $ {pendingDisplay.toFixed(2)}
                      </td>
                    </tr>
                    <tr style={{ height: '28px' }}>
                      <td style={{ width: '90%', background: '#000', color: '#fff', textAlign: 'right', paddingRight: '15px', border: '1px solid #000', fontSize: '13px', fontWeight: 'bold' }}>
                        Account Total Balance
                      </td>
                      <td style={{ width: '10%', background: '#000', color: '#fff', textAlign: 'center', fontWeight: 'bold', border: '1px solid #000', fontSize: '14px', whiteSpace: 'nowrap' }}>
                        $ {accountDisplay.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginTop: '15px', lineHeight: '1.6' }}>
                  Your account balance is <strong>${pendingDisplay.toFixed(2)}</strong> Please make your payment to cover the balance by the due date.<br />
                  Make all checks payable to Ceylon Engineers<br />
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Thank you for your business!</span><br />
                  <span style={{ fontSize: '13px', fontWeight: 'normal' }}>
                    69/1 Peter Mendis Road, Negombo, Sri Lanka, 11500<br />
                    Tel: +94770043258 E-mail: jnceylonproducts@gmail.com
                  </span>
                </div>
              </>
            )}
          </div>
        )}
        <div className="page-number">Page {i + 1} of {totalPages}</div>
      </div>
    );
  }

  return <>{pages}</>;
};

export default StatementTemplate;
