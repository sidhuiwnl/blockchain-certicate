import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCertificates } from '../contexts/CertificateContext';
import Navbar from '../components/Navbar';
import { computeContentHash } from '../utils/hash';
import { readOnChainCert, toCertId } from '../utils/blockchain';
import QRScanner from '../components/QRScanner';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  QrCode, 
  Shield, 
  Calendar,
  Building,
  User,
  Award,
  FileText,
  ExternalLink
} from 'lucide-react';

const PublicVerification: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { verifyCertificate } = useCertificates();
  const [searchId, setSearchId] = useState(certificateId || '');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (certificateId) {
      handleVerify(certificateId);
    }
  }, [certificateId]);

  const handleVerify = async (id: string) => {
    setLoading(true);
    setHasSearched(true);
    
    // Local lookup
    const local = verifyCertificate(id);
    if (!local) {
      setVerificationResult(null);
      setLoading(false);
      return;
    }

    // Compute expected content hash from canonical payload (matches issuance logic)
    const normalizedEmail = (local.studentEmail || '').trim().toLowerCase();
    const payload = {
      institutionId: local.institutionId,
      courseName: local.courseName,
      grade: local.grade,
      issueDate: local.issueDate,
      completionDate: local.completionDate,
      certificateType: local.certificateType,
      studentEmailHash: computeContentHash({ email: normalizedEmail })
    };
    const expectedHash = computeContentHash(payload as Record<string, unknown>);

    // Read on-chain (if env configured). If not configured, fall back to local-only.
    let chainStatus: { onChain?: any; match?: boolean } = {};
    try {
      const certIdHex32 = toCertId(local.id) as `0x${string}`;
      const onChain = await readOnChainCert(certIdHex32);
      if (onChain && typeof onChain.issuedAt === 'bigint') {
        const match = (onChain.contentHash?.toLowerCase?.() || '') === expectedHash.toLowerCase();
        chainStatus = { onChain, match };
      }
    } catch (e) {
      console.warn('On-chain read skipped/failed', e);
    }

    setVerificationResult({ ...local, expectedHash, chainStatus });
    setLoading(false);
  };

  const handleSearch = () => {
    if (searchId.trim()) {
      handleVerify(searchId.trim());
    }
  };

  const handleQRScan = (result: string) => {
    // Extract certificate ID from QR code result
    // The QR code contains the full verification URL
    const urlParts = result.split('/');
    const certId = urlParts[urlParts.length - 1];
    
    if (certId) {
      setSearchId(certId);
      handleVerify(certId);
    }
    setShowScanner(false);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="mt-2 text-gray-600">
            Verify the authenticity of academic certificates using blockchain technology
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter certificate ID to verify"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Or scan QR code from certificate</p>
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center space-x-2"
            >
              <QrCode className="h-4 w-4" />
              <span>Scan QR Code</span>
            </button>
          </div>
        </div>

        {/* Verification Result */}
        {hasSearched && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {verificationResult ? (
              <div className="space-y-6">
                {/* Success Header */}
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">Certificate Verified</h2>
                  <p className="text-green-600">This certificate is authentic and verified on the blockchain</p>
                </div>

                {/* Certificate Details */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Student</p>
                          <p className="text-lg font-semibold text-gray-900">{verificationResult.studentName}</p>
                          <p className="text-sm text-gray-600">{verificationResult.studentEmail}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Award className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Course</p>
                          <p className="text-lg font-semibold text-gray-900">{verificationResult.courseName}</p>
                          <p className="text-sm text-gray-600">Grade: {verificationResult.grade}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Building className="h-5 w-5 text-purple-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Institution</p>
                          <p className="text-lg font-semibold text-gray-900">{verificationResult.institutionName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-orange-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Issue Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(verificationResult.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-orange-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Completion Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(verificationResult.completionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Certificate Type</p>
                          <p className="text-lg font-semibold text-gray-900 capitalize">{verificationResult.certificateType}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Verification</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Blockchain Hash</p>
                        <p className="text-xs font-mono text-gray-600 break-all">{verificationResult.blockchainHash}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">IPFS Hash</p>
                        <p className="text-xs font-mono text-gray-600 break-all">{verificationResult.ipfsHash}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="border-t border-gray-200 pt-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate QR Code</h3>
                  <div className="flex justify-center">
                    <img 
                      src={verificationResult.qrCode} 
                      alt="Certificate QR Code" 
                      className="w-32 h-32 border border-gray-200 rounded-lg bg-white p-2"
                      onError={(e) => {
                        console.error('QR Code failed to load:', verificationResult.qrCode);
                        e.currentTarget.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(window.location.origin + '/verify/' + verificationResult.id)}`;
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Scan this QR code to verify the certificate
                  </p>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-6 flex justify-center space-x-4">
                  <Link
                    to={`/certificate/${verificationResult.id}`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Full Certificate</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-800 mb-2">Certificate Not Found</h2>
                <p className="text-red-600 mb-4">
                  The certificate ID provided does not exist in our blockchain records
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      This certificate may be fraudulent or the ID may be incorrect
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Verification Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Enter Certificate ID</h3>
              <p className="text-sm text-gray-600">Enter the unique certificate ID or scan the QR code</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Blockchain Lookup</h3>
              <p className="text-sm text-gray-600">System checks the certificate hash against blockchain records</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Instant Results</h3>
              <p className="text-sm text-gray-600">Get immediate verification results with full certificate details</p>
            </div>
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

export default PublicVerification;