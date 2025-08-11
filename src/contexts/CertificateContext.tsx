import React, { createContext, useContext, useState } from 'react';
import { generateQRCodeForCertificate } from '../utils/qrCodeGenerator';
import { computeContentHash, toCertId } from '../utils/hash';
import { writeOnChainIssue, readOnChainCert } from '../utils/blockchain';

interface Certificate {
  id: string;
  studentName: string;
  studentEmail: string;
  institutionName: string;
  institutionId: string;
  courseName: string;
  grade: string;
  issueDate: string;
  completionDate: string;
  blockchainHash: string;
  ipfsHash: string;
  qrCode: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  fileUrl?: string;
  certificateType: 'degree' | 'diploma' | 'certificate' | 'transcript';
}

interface CertificateContextType {
  certificates: Certificate[];
  addCertificate: (certificate: Omit<Certificate, 'id' | 'blockchainHash' | 'ipfsHash' | 'qrCode' | 'isVerified'>) => Promise<string>;
  verifyCertificate: (certificateId: string) => Promise<Certificate | null>;
  getCertificatesByStudent: (studentEmail: string) => Certificate[];
  getCertificatesByInstitution: (institutionId: string) => Certificate[];
  updateCertificateStatus: (certificateId: string, status: 'verified' | 'rejected') => void;
  generateHash: (data: string) => string;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
};

export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const generateHash = (data: string): string => {
    // Simulate SHA-256 hash generation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `0x${Math.abs(hash).toString(16)}...`;
  };

  const addCertificate = async (certificateData: Omit<Certificate, 'id' | 'blockchainHash' | 'ipfsHash' | 'qrCode' | 'isVerified'>): Promise<string> => {
    const id = toCertId(certificateData);
    // Build a canonical, non-PII payload for deterministic hashing
    const normalizedEmail = (certificateData.studentEmail || '').trim().toLowerCase();
    const hashPayload = {
      institutionId: certificateData.institutionId,
      courseName: certificateData.courseName,
      grade: certificateData.grade,
      issueDate: certificateData.issueDate,
      completionDate: certificateData.completionDate,
      certificateType: certificateData.certificateType,
      studentEmailHash: computeContentHash({ email: normalizedEmail })
    };
    const contentHash = computeContentHash(hashPayload as Record<string, unknown>);
    const ipfsHash = `Qm${Math.random().toString(36).substr(2, 42)}`;
    
    // Generate QR code as data URL
    const qrCode = await generateQRCodeForCertificate(id);

    const txHash = await writeOnChainIssue(id, contentHash, ipfsHash);

    if (!txHash) {
      throw new Error('Failed to issue certificate on-chain');
    }

    const newCertificate: Certificate = {
      ...certificateData,
      id,
      blockchainHash: txHash,
      ipfsHash,
      qrCode,
      isVerified: true,
      verificationStatus: 'verified'
    };

    const updatedCertificates = [...certificates, newCertificate];
    setCertificates(updatedCertificates);
    
    return id;
  };

  const verifyCertificate = async (certificateId: string): Promise<Certificate | null> => {
    const onChainCert = await readOnChainCert(certificateId as `0x${string}`);
    if (!onChainCert) {
      return null;
    }

    // For now, we'll just return a partial object with on-chain data.
    // In a real app, you'd fetch the full metadata from IPFS or a database.
    return {
      id: certificateId,
      studentName: 'N/A',
      studentEmail: 'N/A',
      institutionName: 'N/A',
      institutionId: onChainCert.issuer,
      courseName: 'N/A',
      grade: 'N/A',
      issueDate: new Date(Number(onChainCert.issuedAt) * 1000).toISOString(),
      completionDate: 'N/A',
      blockchainHash: onChainCert.contentHash,
      ipfsHash: onChainCert.uri,
      qrCode: '', // QR code can be regenerated if needed
      isVerified: !onChainCert.revoked,
      verificationStatus: onChainCert.revoked ? 'rejected' : 'verified',
      certificateType: 'degree',
    };
  };

  const getCertificatesByStudent = (studentEmail: string): Certificate[] => {
    return certificates.filter(cert => cert.studentEmail === studentEmail);
  };

  const getCertificatesByInstitution = (institutionId: string): Certificate[] => {
    return certificates.filter(cert => cert.institutionId === institutionId);
  };

  const updateCertificateStatus = (certificateId: string, status: 'verified' | 'rejected'): void => {
    const updatedCertificates = certificates.map(cert => 
      cert.id === certificateId 
        ? { ...cert, verificationStatus: status, isVerified: status === 'verified' }
        : cert
    );
    setCertificates(updatedCertificates);
  };

  return (
    <CertificateContext.Provider value={{
      certificates,
      addCertificate,
      verifyCertificate,
      getCertificatesByStudent,
      getCertificatesByInstitution,
      updateCertificateStatus,
      generateHash
    }}>
      {children}
    </CertificateContext.Provider>
  );
};