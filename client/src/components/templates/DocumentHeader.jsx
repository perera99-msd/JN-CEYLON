import React from 'react';

const DocumentHeader = ({ docType }) => {
  let displayTitle = docType;
  if (docType === 'STATEMENT') {
    displayTitle = 'STATEMENT';
  }

  return (
    <div className="header-black-bg">
      <div className="header-top-row">
        <div className="logo-col">
          <img src="/Logo.png" alt="Logo" onError={(e) => { e.target.src = '/logo.png'; }} />
        </div>
        <div className="address-col">
          No 69/1 PETER MENDIS ROAD,<br />
          NEGOMBO,<br />
          SRI LANKA<br />
          11500<br />
          REG NO - WV15257<br />
          TEL - +94770043258<br />
          EMAIL - jnceylonproducts@gmail.com
        </div>
        <div className="title-col">
          <div className="title-box">{displayTitle}</div>
        </div>
      </div>
      <hr className="header-divider" />
      <div className="tagline">
        -Importers, Exporters and Distributors of all kinds of Electrical and Mechanical quality spare parts.-
      </div>
    </div>
  );
};

export default DocumentHeader;
