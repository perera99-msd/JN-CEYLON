import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuotationListPage from './pages/quotations/QuotationListPage';
import QuotationEditorPage from './pages/quotations/QuotationEditorPage';
import QuotationViewPage from './pages/quotations/QuotationViewPage';
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import InvoiceEditorPage from './pages/invoices/InvoiceEditorPage';
import InvoiceViewPage from './pages/invoices/InvoiceViewPage';
import StatementListPage from './pages/statements/StatementListPage';
import StatementViewPage from './pages/statements/StatementViewPage';
import PaymentListPage from './pages/payments/PaymentListPage';
import CompanyListPage from './pages/companies/CompanyListPage';

import PrintQuotation from './pages/print/PrintQuotation';
import PrintInvoice from './pages/print/PrintInvoice';
import PrintStatement from './pages/print/PrintStatement';

import './styles/dashboard.css';
import './styles/document.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Main Dashboard Routes */}
          <Route path="/" element={<DashboardPage />} />
          
          <Route path="/quotations" element={<QuotationListPage />} />
          <Route path="/quotations/new" element={<QuotationEditorPage />} />
          <Route path="/quotations/edit/:id" element={<QuotationEditorPage />} />
          <Route path="/quotations/view/:id" element={<QuotationViewPage />} />

          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/invoices/new" element={<InvoiceEditorPage />} />
          <Route path="/invoices/edit/:id" element={<InvoiceEditorPage />} />
          <Route path="/invoices/view/:id" element={<InvoiceViewPage />} />

          <Route path="/statements" element={<StatementListPage />} />
          <Route path="/statements/view/:companyId" element={<StatementViewPage />} />

          <Route path="/payments" element={<PaymentListPage />} />
          <Route path="/companies" element={<CompanyListPage />} />

          {/* Print-Only Standalone Routes (for window.print and Puppeteer) */}
          <Route path="/print/quotation/:id" element={<PrintQuotation />} />
          <Route path="/print/invoice/:id" element={<PrintInvoice />} />
          <Route path="/print/statement/:companyId" element={<PrintStatement />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
