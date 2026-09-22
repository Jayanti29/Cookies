import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './i18n';
import { Layout } from './components/Layout';

// Import Pages
import { Home } from './pages/Home';
import { UniversalChecker } from './pages/UniversalChecker';
import { WebsiteScanner } from './pages/WebsiteScanner';
import { MessageChecker } from './pages/MessageChecker';
import { JobGuard } from './pages/JobGuard';
import { PaymentAnalyzer } from './pages/PaymentAnalyzer';
import { QRChecker } from './pages/QRChecker';
import { Camera } from './pages/Camera';
import { LiveGuard } from './pages/LiveGuard';
import { Results } from './pages/Results';
import { Reports } from './pages/Reports';
import { ReportWizard } from './pages/ReportWizard';
import { EvidenceVault } from './pages/EvidenceVault';
import { Dashboard } from './pages/Dashboard';
import { Subscriptions } from './pages/Subscriptions';
import { TrueCost } from './pages/TrueCost';
import { Learn } from './pages/Learn';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';

export function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/check" element={<UniversalChecker />} />
            <Route path="/check/website" element={<WebsiteScanner />} />
            <Route path="/check/message" element={<MessageChecker />} />
            <Route path="/check/job" element={<JobGuard />} />
            <Route path="/check/payment" element={<PaymentAnalyzer />} />
            <Route path="/check/qr" element={<QRChecker />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/camera/live" element={<LiveGuard />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/new" element={<ReportWizard />} />
            <Route path="/evidence" element={<EvidenceVault />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/true-cost" element={<TrueCost />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </Layout>
        <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      </Router>
    </LanguageProvider>
  );
}

export default App;
