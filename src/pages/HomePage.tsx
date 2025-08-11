
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, CheckCircle, Users, ArrowRight, Zap, Lock, Globe, Fingerprint, QrCode, Database } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const dashboardLink = isAuthenticated
    ? user?.role === 'student'
      ? '/student'
      : user?.role === 'institution'
        ? '/institution'
        : '/verifier'
    : '/register';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 text-xs uppercase tracking-wide">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>On-chain verification • QR enabled</span>
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                Issue. Verify. Trust.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Blockchain Certificates</span>
              </h1>
              <p className="mt-6 text-lg text-gray-300 max-w-2xl">
                CertSecure is a role-based platform for institutions, students, and verifiers to issue, share, and validate tamper-proof credentials globally.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to={dashboardLink} className="btn-primary inline-flex items-center justify-center">
                  Get started
                </Link>
                <Link to="/verify" className="btn-secondary inline-flex items-center justify-center">
                  Verify a certificate
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 text-center">
                <div className="glass rounded-lg p-4">
                  <p className="text-3xl font-semibold text-white">4.9/5</p>
                  <p className="text-xs text-gray-300">Satisfaction</p>
                </div>
                <div className="glass rounded-lg p-4">
                  <p className="text-3xl font-semibold text-white">40+</p>
                  <p className="text-xs text-gray-300">Countries</p>
                </div>
                <div className="glass rounded-lg p-4">
                  <p className="text-3xl font-semibold text-white">Millions</p>
                  <p className="text-xs text-gray-300">Verifications</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="relative glass rounded-2xl p-8 border border-white/10 text-white">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  <h3 className="text-lg font-semibold">On-chain proof</h3>
                </div>
                <p className="mt-2 text-sm text-gray-200">Certificates are hashed and anchored on-chain. Anyone can verify without trusting a middleman.</p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="glass rounded-lg p-4 text-center">
                    <Fingerprint className="h-6 w-6 mx-auto text-emerald-300" />
                    <p className="mt-2 text-xs">Immutable</p>
                  </div>
                  <div className="glass rounded-lg p-4 text-center">
                    <QrCode className="h-6 w-6 mx-auto text-blue-300" />
                    <p className="mt-2 text-xs">QR-enabled</p>
                  </div>
                  <div className="glass rounded-lg p-4 text-center">
                    <Database className="h-6 w-6 mx-auto text-purple-300" />
                    <p className="mt-2 text-xs">Auditable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything you need for trusted credentials</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">From issuance to verification, CertSecure streamlines the lifecycle with security-first tooling.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[{
              title: 'Tamper-proof security',
              desc: 'Each certificate is hashed with cryptographic integrity and anchored on-chain.',
              Icon: Lock
            }, {
              title: 'Instant verification',
              desc: 'Scan a QR or paste an ID to verify provenance in seconds.',
              Icon: Zap
            }, {
              title: 'Global recognition',
              desc: 'Decentralized verification across borders and institutions.',
              Icon: Globe
            }, {
              title: 'Role-based access',
              desc: 'Dashboards tailored for institutions, students, and verifiers.',
              Icon: Users
            }, {
              title: 'Shareable credentials',
              desc: 'Secure links and QR codes for resumes, LinkedIn, and applications.',
              Icon: Award
            }, {
              title: 'Audit trail',
              desc: 'Immutable logs for every lifecycle action and verification.',
              Icon: Database
            }].map(({ title, desc, Icon }) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[{
              step: '1', title: 'Issue', desc: 'Institutions issue signed certificates with one click.'
            }, { step: '2', title: 'Anchor', desc: 'We hash and anchor proofs on-chain for immutability.' }, { step: '3', title: 'Verify', desc: 'Anyone verifies with a QR scan or certificate ID.' }].map(({ step, title, desc }) => (
              <div key={title} className="rounded-xl bg-white border border-gray-200 p-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">{step}</div>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-12 text-white flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">Ready to issue your first blockchain certificate?</h3>
              <p className="mt-2 text-white/90">Join institutions and teams securing credentials with CertSecure.</p>
            </div>
            <div className="mt-6 md:mt-0 flex gap-3">
              <Link to={dashboardLink} className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-white text-gray-900 font-medium hover:bg-white/90">
                Get started
              </Link>
              <Link to="/verify" className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-white/20 text-white font-medium hover:bg-white/25">
                Verify a certificate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="h-7 w-7 text-emerald-400" />
                <span className="text-xl font-bold">CertSecure</span>
              </div>
              <p className="mt-4 text-sm text-gray-300">The trusted way to issue and validate tamper-proof credentials.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:col-span-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-200">Product</h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  <li><Link to="#" className="hover:text-white">For Institutions</Link></li>
                  <li><Link to="#" className="hover:text-white">For Students</Link></li>
                  <li><Link to="#" className="hover:text-white">For Verifiers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-200">Company</h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  <li><Link to="#" className="hover:text-white">About</Link></li>
                  <li><Link to="#" className="hover:text-white">Blog</Link></li>
                  <li><Link to="#" className="hover:text-white">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-gray-400">&copy; 2024 CertSecure. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
