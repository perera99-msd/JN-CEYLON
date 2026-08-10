import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import PrivateRoute from './components/auth/PrivateRoute';

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
import CustomStatementEditor from './pages/statements/CustomStatementEditor';
import PaymentListPage from './pages/payments/PaymentListPage';
import CompanyListPage from './pages/companies/CompanyListPage';
import RecycleBinPage from './pages/RecycleBinPage';
import SettingsPage from './pages/SettingsPage';

import PrintQuotation from './pages/print/PrintQuotation';
import PrintInvoice from './pages/print/PrintInvoice';
import PrintStatement from './pages/print/PrintStatement';
import PrintCustomStatement from './pages/print/PrintCustomStatement';

import './styles/dashboard.css';
import './styles/document.css';

function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Main Dashboard Routes */}
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

            <Route path="/quotations" element={<PrivateRoute><QuotationListPage /></PrivateRoute>} />
            <Route path="/quotations/new" element={<PrivateRoute><QuotationEditorPage /></PrivateRoute>} />
            <Route path="/quotations/edit/:id" element={<PrivateRoute><QuotationEditorPage /></PrivateRoute>} />
            <Route path="/quotations/view/:id" element={<PrivateRoute><QuotationViewPage /></PrivateRoute>} />

            <Route path="/invoices" element={<PrivateRoute><InvoiceListPage /></PrivateRoute>} />
            <Route path="/invoices/new" element={<PrivateRoute><InvoiceEditorPage /></PrivateRoute>} />
            <Route path="/invoices/edit/:id" element={<PrivateRoute><InvoiceEditorPage /></PrivateRoute>} />
            <Route path="/invoices/view/:id" element={<PrivateRoute><InvoiceViewPage /></PrivateRoute>} />

            <Route path="/statements" element={<PrivateRoute><StatementListPage /></PrivateRoute>} />
            <Route path="/statements/view/:companyId" element={<PrivateRoute><StatementViewPage /></PrivateRoute>} />
            <Route path="/statements/custom/new" element={<PrivateRoute><CustomStatementEditor /></PrivateRoute>} />
            <Route path="/statements/custom/edit/:id" element={<PrivateRoute><CustomStatementEditor /></PrivateRoute>} />

            <Route path="/payments" element={<PrivateRoute><PaymentListPage /></PrivateRoute>} />
            <Route path="/companies" element={<PrivateRoute><CompanyListPage /></PrivateRoute>} />
            <Route path="/recycle-bin" element={<PrivateRoute><RecycleBinPage /></PrivateRoute>} />

            {/* Admin-Only Settings Route */}
            <Route path="/settings" element={<PrivateRoute adminOnly={true}><SettingsPage /></PrivateRoute>} />

            {/* Print-Only Standalone Routes */}
            <Route path="/print/quotation/:id" element={<PrintQuotation />} />
            <Route path="/print/invoice/:id" element={<PrintInvoice />} />
            <Route path="/print/statement/:companyId" element={<PrintStatement />} />
            <Route path="/print/custom-statement/:id" element={<PrintCustomStatement />} />
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;
