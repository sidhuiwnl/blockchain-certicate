import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCertificates } from '../contexts/CertificateContext';
import Navbar from '../components/Navbar';
import { Award, Upload, Calendar, User, BookOpen, GraduationCap } from 'lucide-react';
import { getAccounts, requestAccounts, shortenAddress, getChainId, isEthereumAvailable } from '../utils/blockchain';


const IssueCertificate: React.FC = () => {
  const { user } = useAuth();
  const { addCertificate } = useCertificates();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    courseName: '',
    grade: '',
    completionDate: '',
    certificateType: 'certificate' as 'degree' | 'diploma' | 'certificate' | 'transcript'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  useEffect(() => {
    // Try to read existing connection silently
    (async () => {
      const [addr] = await getAccounts();
      if (addr) setWalletAddress(addr);
      const id = await getChainId();
      if (id) setChainId(id);
    })();
  }, []);

  const handleConnectWallet = async () => {
    if (!isEthereumAvailable()) {
      alert('MetaMask not found. Please install MetaMask to continue.');
      return;
    }
    const accounts = await requestAccounts();
    if (accounts && accounts.length > 0) {
      setWalletAddress(accounts[0]);
      const id = await getChainId();
      setChainId(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const certificateData = {
        ...formData,
        institutionName: user?.institutionName || 'Unknown Institution',
        institutionId: user?.id || '',
        issueDate: new Date().toISOString().split('T')[0],
        verificationStatus: 'verified' as const
      };

      await addCertificate(certificateData);
      
      alert('Certificate issued successfully!');
      navigate('/institution');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to issue certificate: ${err.message}`);
      } else {
        setError('Failed to issue certificate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issue New Certificate</h1>
              <p className="mt-2 text-gray-600">Create a new blockchain-secured certificate for your student.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {walletAddress ? (
                <div className="text-sm text-gray-700">
                  Connected: <span className="font-mono">{shortenAddress(walletAddress)}</span>
                  {chainId && (
                    <span className="ml-2 text-gray-500">(chain {chainId})</span>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                Student Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    required
                    value={formData.studentName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter student's full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700">
                    Student Email *
                  </label>
                  <input
                    type="email"
                    id="studentEmail"
                    name="studentEmail"
                    required
                    value={formData.studentEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="student@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                Course Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    name="courseName"
                    required
                    value={formData.courseName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Computer Science - Bachelor of Science"
                  />
                </div>
                
                <div>
                  <label htmlFor="certificateType" className="block text-sm font-medium text-gray-700">
                    Certificate Type *
                  </label>
                  <select
                    id="certificateType"
                    name="certificateType"
                    required
                    value={formData.certificateType}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="certificate">Certificate</option>
                    <option value="diploma">Diploma</option>
                    <option value="degree">Degree</option>
                    <option value="transcript">Transcript</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                    Grade/GPA *
                  </label>
                  <input
                    type="text"
                    id="grade"
                    name="grade"
                    required
                    value={formData.grade}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., A, 3.8, 85%"
                  />
                </div>
              </div>
            </div>

            {/* Completion Information */}
            <div className="pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                Completion Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">
                    Completion Date *
                  </label>
                  <input
                    type="date"
                    id="completionDate"
                    name="completionDate"
                    required
                    value={formData.completionDate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={user?.institutionName || 'Unknown Institution'}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 text-orange-600 mr-2" />
                Certificate Document (Optional)
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload the certificate document (PDF, JPG, PNG)
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  The document will be stored securely and its hash will be recorded on the blockchain
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="certificateFile"
                />
                <label
                  htmlFor="certificateFile"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => navigate('/institution')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Issuing Certificate...</span>
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4" />
                    <span>Issue Certificate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueCertificate;