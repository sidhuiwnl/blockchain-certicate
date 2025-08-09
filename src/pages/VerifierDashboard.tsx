import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCertificates } from '../contexts/CertificateContext';
import Navbar from '../components/Navbar';
import QRScanner from '../components/QRScanner';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Calendar,
  Building,
  Users,
  FileText,
  QrCode
} from 'lucide-react';

const VerifierDashboard: React.FC = () => {
  const { user } = useAuth();
  const { certificates, verifyCertificate } = useCertificates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleVerify = (certificateId: string) => {
    const result = verifyCertificate(certificateId);
    setVerificationResult(result);
    setSelectedCertificate(certificateId);
  };

  const handleQuickVerify = () => {
    if (searchTerm.trim()) {
      const result = verifyCertificate(searchTerm.trim());
      setVerificationResult(result);
      setSelectedCertificate(searchTerm.trim());
    }
  };

  const handleQRScan = (result: string) => {
    // Extract certificate ID from QR code result
    const urlParts = result.split('/');
    const certId = urlParts[urlParts.length - 1];
    
    if (certId) {
      setSearchTerm(certId);
      handleVerify(certId);
    }
    setShowScanner(false);
  };
  const recentVerifications = certificates.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verifier Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome, {user?.name}! Verify certificates and credentials here.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Certificates</h3>
                <p className="text-3xl font-bold text-blue-600">{certificates.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Verified</h3>
                <p className="text-3xl font-bold text-green-600">
                  {certificates.filter(cert => cert.isVerified).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Institutions</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(certificates.map(cert => cert.institutionName)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Students</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {new Set(certificates.map(cert => cert.studentEmail)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Verification */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Certificate Verification</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter certificate ID or scan QR code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleQuickVerify}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Verify</span>
            </button>
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <QrCode className="h-4 w-4" />
              <span>Scan QR</span>
            </button>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Result</h2>
            
            {verificationResult ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-800 font-semibold">Certificate Verified Successfully</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Student Name</p>
                      <p className="font-semibold text-gray-900">{verificationResult.studentName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Course</p>
                      <p className="font-semibold text-gray-900">{verificationResult.courseName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Institution</p>
                      <p className="font-semibold text-gray-900">{verificationResult.institutionName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Grade</p>
                      <p className="font-semibold text-gray-900">{verificationResult.grade}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Issue Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(verificationResult.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Completion Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(verificationResult.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Blockchain Hash</p>
                      <p className="font-mono text-xs text-gray-900">{verificationResult.blockchainHash}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Certificate Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{verificationResult.certificateType}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      This certificate is authentic and has been verified on the blockchain
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-800 font-semibold">Certificate Not Found</span>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      The certificate ID provided does not exist in our blockchain records
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Certificates */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Certificates</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentVerifications.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{certificate.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{certificate.studentName}</div>
                        <div className="text-sm text-gray-500">{certificate.studentEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{certificate.institutionName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(certificate.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        certificate.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {certificate.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleVerify(certificate.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Verify</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <QRScanner 
        isOpen={showScanner}
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default VerifierDashboard;