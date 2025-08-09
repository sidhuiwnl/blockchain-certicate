import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCertificates } from '../contexts/CertificateContext';
import Navbar from '../components/Navbar';
import { Award, Download, Share2, QrCode, Calendar, Building } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getCertificatesByStudent } = useCertificates();
  const certificates = getCertificatesByStudent(user?.email || '');

  const downloadCertificate = (certificateId: string) => {
    // Simulate certificate download
    alert(`Certificate ${certificateId} downloaded!`);
  };

  const shareCertificate = (certificateId: string) => {
    const url = `${window.location.origin}/verify/${certificateId}`;
    navigator.clipboard.writeText(url);
    alert('Certificate verification link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.name}! Manage your certificates here.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-blue-600" />
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
                <Building className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Verified Institutions</h3>
                <p className="text-3xl font-bold text-green-600">
                  {new Set(certificates.map(cert => cert.institutionName)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Certificates</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {certificates.filter(cert => {
                    const issueDate = new Date(cert.issueDate);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return issueDate > monthAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Certificates</h2>
          </div>
          
          {certificates.length === 0 ? (
            <div className="p-8 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
              <p className="text-gray-600">Your certificates will appear here once they're issued by institutions.</p>
            </div>
          ) : (
            <div className="grid gap-6 p-6">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{certificate.courseName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          certificate.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {certificate.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Institution</p>
                          <p className="font-medium text-gray-900">{certificate.institutionName}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Grade</p>
                          <p className="font-medium text-gray-900">{certificate.grade}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Issue Date</p>
                          <p className="font-medium text-gray-900">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Completion Date</p>
                          <p className="font-medium text-gray-900">{new Date(certificate.completionDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        <p>Blockchain Hash: <span className="font-mono text-xs">{certificate.blockchainHash}</span></p>
                        <p>IPFS Hash: <span className="font-mono text-xs">{certificate.ipfsHash}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <img 
                        src={certificate.qrCode} 
                        alt="QR Code" 
                        className="w-20 h-20 border border-gray-200 rounded bg-white p-1"
                        onError={(e) => {
                          console.error('QR Code failed to load:', certificate.qrCode);
                          e.currentTarget.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(window.location.origin + '/verify/' + certificate.id)}`;
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => downloadCertificate(certificate.id)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      
                      <button
                        onClick={() => shareCertificate(certificate.id)}
                        className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                      
                      <a
                        href={`/verify/${certificate.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Verify</span>
                      </a>
                    </div>
                    
                    <span className="text-sm text-gray-500">
                      Type: {certificate.certificateType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;