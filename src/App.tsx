
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CertificateProvider } from './contexts/CertificateContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import VerifierDashboard from './pages/VerifierDashboard';
import PublicVerification from './pages/PublicVerification';
import CertificateDetails from './pages/CertificateDetails';
import IssueCertificate from './pages/IssueCertificate';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CertificateProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute allowedRoles={['student', 'institution', 'verifier']}>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/student/*" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/institution/*" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/verifier/*" element={
                <ProtectedRoute allowedRoles={['verifier']}>
                  <VerifierDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/certificate/:id" element={
                <ProtectedRoute allowedRoles={['student', 'institution']}>
                  <CertificateDetails />
                </ProtectedRoute>
              } />

              <Route path="/issue-certificate" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <IssueCertificate />
                </ProtectedRoute>
              } />

              <Route path="/verify" element={
                <ProtectedRoute allowedRoles={['institution', 'verifier']}>
                  <PublicVerification />
                </ProtectedRoute>
              } />

              <Route path="/verify/:certificateId" element={
                <ProtectedRoute allowedRoles={['institution', 'verifier']}>
                  <PublicVerification />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CertificateProvider>
    </AuthProvider>
  );
}

export default App;
