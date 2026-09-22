import React, { useRef, useLayoutEffect } from 'react';
import DocumentHeader from './DocumentHeader';
import { formatMoney } from '../../utils/format';

/**
 * AutoShrinkText — renders children at the default font size.
 * After mount/update it checks if the content height exceeds `maxHeight`.
 * If so, it shrinks the font-size by `step` px at a time until the content
 * fits or the minimum font size is reached.
 *
 * This preserves word-wrap (line breaks happen first), and only reduces size
 * as a last resort. When content fits at the default size, nothing changes.
 */
const AutoShrinkText = ({ children, maxHeight, defaultSize = 12, minSize = 7.5, step = 0.4, style }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !maxHeight) return;

    // Reset to default each time content changes
    el.style.fontSize = `${defaultSize}px`;

    // scrollHeight reflects full content height even for auto-height elements
    let size = defaultSize;
    while (el.scrollHeight > maxHeight && size > minSize) {
      size = Math.round((size - step) * 10) / 10;
      el.style.fontSize = `${size}px`;
    }
  }, [children, maxHeight, defaultSize, minSize, step]);

  return (
    <span
      ref={ref}
      style={{
        display: 'block',
        fontSize: `${defaultSize}px`,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        lineHeight: 'inherit',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/**
 * Returns inline styles for item thumbnail images based on how many
 * image-bearing items exist on the current page.
 *
 * Sizing scale (per-page image count):
 *  1 image  → 160px tall — solo spotlight
 *  2 images → 140px tall — "much larger" (user requirement)
 *  3 images → 105px tall — comfortably fits
 *  4 images → 80px  tall — noticeably smaller
 *  5 images → 62px  tall — compact but readable
 *  0/other  → 38px  tall — fallback (matches CSS default)
 */
const getImageStyle = (imageCount) => {
  const sizeMap = {
    1: { maxHeight: '160px', maxWidth: '180px' },
    2: { maxHeight: '140px', maxWidth: '160px' },
    3: { maxHeight: '105px', maxWidth: '130px' },
    4: { maxHeight: '80px',  maxWidth: '110px' },
    5: { maxHeight: '62px',  maxWidth: '95px'  },
  };
  const size = sizeMap[imageCount] || { maxHeight: '38px', maxWidth: '80px' };
  return {
    ...size,
    objectFit: 'contain',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '4px',
  };
};

/**
 * Row padding scale — taller rows when images are larger so content breathes.
 */
const getRowPadding = (imageCount, itemCount) => {
  if (imageCount === 0) {
    const textOnlyPadding = {
      1: '30px 5px',
      2: '20px 5px',
      3: '14px 5px',
      4: '11px 5px',
      5: '9px 5px',
      6: '8px 5px',
      7: '7px 5px',
      8: '6px 5px',
      9: '5px 5px',
      10: '4px 5px',
    };
    return textOnlyPadding[Math.min(itemCount, 10)] || '4px 5px';
  }
  if (imageCount >= 4) return '5px 5px';
  if (imageCount === 3) return '7px 5px';
  if (imageCount === 2) return '9px 5px';
  if (imageCount === 1) return '11px 5px';
  return '4px 5px'; // text-only rows
};

// Shared border — matches the totals table aesthetic exactly
const BORDER = '1px solid #000';

/**
 * Renders the products table. Extracted to avoid duplicating JSX for first-page
 * vs. continuation pages. Called with the page's items and its image count.
 */
const renderTable = (pageItems, pageImageCount) => {
  const rowPadding = getRowPadding(pageImageCount, pageItems.length);
  const hasImages = pageImageCount > 0;

  /**
   * Max heights for AutoShrinkText — matched to image size on image pages
   * so description text never grows the row taller than the image already does.
   * On text-only pages (10 items), use a compact fixed limit per row.
   */
  const imgPx = pageImageCount > 0 ? parseInt(getImageStyle(pageImageCount).maxHeight) : 0;
  // Product name sits ABOVE the image; give it a portion of the image height
  const maxNameHeight = hasImages ? Math.max(30, imgPx * 0.35) : 48;
  // Description cell should not exceed the image height (the row's natural max)
  const maxDescHeight = hasImages ? imgPx + 20 : 52;

  return (
    <div style={{ flexGrow: 0, display: 'flex', flexDirection: 'column', marginBottom: '6px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: BORDER,
          tableLayout: 'fixed',
        }}
      >
        {/* ── HEADER ── */}
        <thead>
          <tr>
            {[
              { label: 'NO',          width: '8%'  },
              { label: 'PRODUCT',     width: '34%' },
              { label: 'QTY',         width: '7%'  },
              { label: 'DESCRIPTION', width: '27%' },
              { label: 'PRICE',       width: '12%' },
              { label: 'TOTAL',       width: '12%' },
            ].map(({ label, width }) => (
              <th
                key={label}
                style={{
                  width,
                  backgroundColor: '#000',
                  color: '#fff',
                  border: BORDER,
                  fontSize: '11.5px',
                  padding: '6px 5px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── BODY ── */}
        <tbody>
          {pageItems.map((item, idx) => {
            const isEvenRow = idx % 2 === 0;
            const rowBg     = isEvenRow ? '#ffffff' : '#f5f5f5';
            const totalBg   = isEvenRow ? '#ffffff' : '#f5f5f5';

            // Shared td style — consistent borders, overflow contained
            const tdBase = {
              border: BORDER,
              fontSize: '12px',
              fontWeight: 'bold',
              verticalAlign: 'middle',
              padding: rowPadding,
              overflow: 'hidden',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            };

            return (
              <tr key={idx}>
                {/* NO column — wrap/shrink long part numbers instead of clipping */}
                <td style={{ ...tdBase, width: '8%', textAlign: 'center', backgroundColor: rowBg, overflow: 'visible' }}>
                  <AutoShrinkText maxHeight={hasImages ? imgPx + 30 : 50} style={{ textAlign: 'center' }}>
                    {item.no || ''}
                  </AutoShrinkText>
                </td>

                {/* PRODUCT column — name (auto-shrinks) + dynamic image */}
                {/* overflow:visible so image is never clipped during layout */}
                <td style={{ ...tdBase, width: '34%', textAlign: 'center', backgroundColor: rowBg, lineHeight: '1.3', overflow: 'visible' }}>
                  {item.name && (
                    <AutoShrinkText maxHeight={maxNameHeight} style={{ marginBottom: item.image ? '3px' : '0', textAlign: 'center' }}>
                      {item.name}
                    </AutoShrinkText>
                  )}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || 'product'}
                      style={getImageStyle(pageImageCount)}
                    />
                  )}
                </td>

                {/* QTY column */}
                <td style={{ ...tdBase, width: '7%', textAlign: 'center', backgroundColor: rowBg, whiteSpace: 'nowrap' }}>
                  {item.qty || ''}
                </td>

                {/* DESCRIPTION column — auto-shrinks when content exceeds row height */}
                <td style={{ ...tdBase, width: '27%', textAlign: 'left', backgroundColor: rowBg, lineHeight: '1.35' }}>
                  <AutoShrinkText maxHeight={maxDescHeight}>
                    {item.desc || ''}
                  </AutoShrinkText>
                </td>

                {/* PRICE column */}
                <td style={{ ...tdBase, width: '12%', textAlign: 'right', backgroundColor: rowBg, paddingRight: '7px', fontVariantNumeric: 'tabular-nums' }}>
                  {item.price != null && item.price !== '' ? formatMoney(item.price) : ''}
                </td>

                {/* TOTAL column */}
                <td style={{ ...tdBase, width: '12%', textAlign: 'right', backgroundColor: totalBg, paddingRight: '7px', fontVariantNumeric: 'tabular-nums' }}>
                  {item.total != null && item.total !== '' ? formatMoney(item.total) : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


/* ──────────────────────────────────────────────────────────────────── */

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

  /* ── PAGINATION (unchanged logic) ── */
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

  /* ── RENDER PAGES ── */
  const totalPages = pagedItemGroups.length;
  const pages = pagedItemGroups.map((pageItems, i) => {
    const isFirstPage = i === 0;
    const isLastPage  = i === totalPages - 1;

    // Per-page image count drives dynamic sizing
    const pageImageCount = pageItems.filter(item => item.image).length;

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

              {/* Enhanced table — per-page image count passed in */}
              {renderTable(pageItems, pageImageCount)}

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
            {/* Continuation page — same enhanced table */}
            {renderTable(pageItems, pageImageCount)}

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
