import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const authData = localStorage.getItem('rr_auth');
  const isLoggedIn = !!authData;

  const sections = [
    {
      id: 'collection',
      icon: '📋',
      title: '1. Information We Collect',
      content: [
        'Account & Contact Details: When you register on Rising Roots, we collect your full legal name, email address, mobile/WhatsApp number, and residential city/state.',
        'Government-Issued KYC ID Proof: In accordance with Indian regulatory directives (FIU-IND & PMLA), all subscribers accessing our financial trading intelligence and signals must submit an official government ID (PAN Card, Aadhaar Card, Passport, Driving License, or Voter ID) along with a high-resolution photo/scan.',
        'Technical & Session Information: We automatically record access timestamps, IP addresses, browser types, and session duration to safeguard community accounts from unauthorized takeovers and brute-force attacks.',
      ],
    },
    {
      id: 'purpose',
      icon: '⚖️',
      title: '2. Purpose of Collection & Verification',
      content: [
        'Regulatory & AML Compliance: Anti-Money Laundering (AML) and Counter-Financing of Terrorism (CFT) guidelines require positive identity verification of individuals participating in digital asset intelligence.',
        'Fraud & Sybil Defense: KYC verification ensures that each community membership is tied to an authentic trader, preventing duplicate trials, market manipulation, or unauthorized account reselling.',
        'Desk Alerts & Member Service: Your WhatsApp and email are utilized exclusively to deliver VIP signal alerts, market emergency updates, and subscription renewals.',
      ],
    },
    {
      id: 'security',
      icon: '🛡️',
      title: '3. 256-Bit Data Encryption & Storage Security',
      content: [
        'AES-256 Cloud Encryption: All uploaded government ID documents and personal records are encrypted at rest using industry-standard AES-256 algorithms and transmitted via TLS 1.3 encrypted pipelines.',
        'Restricted Compliance Access: Your sensitive ID proof documents can only be accessed by vetted internal compliance officers inside an authenticated, rate-limited administrative audit portal.',
        'Audit Trail Logging: Every administrative view, approval, or rejection of a KYC submission is permanently logged with timestamps to prevent internal misuse.',
      ],
    },
    {
      id: 'sharing',
      icon: '🚫',
      title: '4. Strict Zero Third-Party Selling Policy',
      content: [
        'We will NEVER sell, rent, monetize, or lease your phone number, email address, or uploaded documents to any third-party marketing agency, advertising network, or data aggregator.',
        'We only disclose personal data if formally mandated by a legally binding court order or authorized Indian statutory authority (e.g. SEBI, FIU-IND, Enforcement Directorate).',
      ],
    },
    {
      id: 'rights',
      icon: '👤',
      title: '5. User Rights & Data Retention',
      content: [
        'Right to Access & Rectify: You can review and update your contact phone, display name, and location anytime via your Dashboard Profile.',
        'Data Retention Limit: KYC records and trade logs are retained for the duration of your active subscription and statutory archiving requirements, after which non-essential records may be securely purged upon written request.',
        'Account Deletion: You may request complete account deactivation and unlinking of credentials by contacting our compliance helpdesk.',
      ],
    },
    {
      id: 'contact',
      icon: '📬',
      title: '6. Grievance Redressal & Compliance Helpdesk',
      content: [
        'Under the Information Technology Act, 2000 and Digital Personal Data Protection Act (DPDP Act, 2023), for any privacy concerns, data inquiries, or KYC assistance, please contact:',
        'Grievance Officer: Compliance & Privacy Desk, Rising Roots Intelligence',
        'Official Email: compliance@risingroots.com | support@risingroots.com',
        'Turnaround Time: All formal privacy inquiries are resolved within 48 business hours.',
      ],
    },
  ];

  return (
    <div className="bg-gray-950 min-h-screen text-white font-sans antialiased selection:bg-emerald-500 selection:text-gray-950">
      {/* Top Header */}
      <header className="border-b border-gray-900 bg-gray-950/80 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-lg shadow-lg shadow-green-500/20">
            RR
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">Rising Roots</span>
            <span className="text-[11px] text-emerald-400 font-medium block -mt-1">Crypto & Forex Intelligence</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={isLoggedIn ? '/dashboard' : '/'}
            className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5"
          >
            ← {isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}
          </Link>
          <Link
            to="/about"
            className="text-xs text-gray-300 hover:text-emerald-400 font-semibold px-3 py-1.5 hidden sm:inline-block"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            Contact Helpdesk →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16 space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
          <span>🛡️</span>
          <span>DPDP Act 2023 & FIU-IND Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Privacy Policy & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Data Protection Pledge</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          How Rising Roots collects, encrypts, and handles your personal details and government-issued KYC documents with zero third-party data selling.
        </p>
        <p className="text-[11px] font-mono text-gray-500">
          Last Updated: November 2026 • Effective for all Rising Roots subscribers worldwide
        </p>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-8">
        {/* Quick Highlights Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
            <span className="text-2xl block mb-2">🔒</span>
            <h3 className="text-sm font-bold text-white">Bank-Grade 256-Bit SSL</h3>
            <p className="text-xs text-gray-400 mt-1">
              All documents, passwords, and API keys are stored in encrypted form with zero plain-text storage.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
            <span className="text-2xl block mb-2">🚫</span>
            <h3 className="text-sm font-bold text-white">Zero Third-Party Selling</h3>
            <p className="text-xs text-gray-400 mt-1">
              We never sell or distribute your contact phone number or email to marketers, telemarketers, or broker affiliates.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
            <span className="text-2xl block mb-2">🇮🇳</span>
            <h3 className="text-sm font-bold text-white">FIU-IND / AML Compliant</h3>
            <p className="text-xs text-gray-400 mt-1">
              Identity verification (PAN / Aadhaar) safeguards honest traders and keeps fraudulent syndicates away.
            </p>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-4 hover:border-emerald-500/30 transition-colors shadow-lg"
            >
              <div className="flex items-center gap-3 border-b border-gray-800/80 pb-3">
                <span className="text-2xl">{sec.icon}</span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">{sec.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {sec.content.map((point, i) => (
                  <li key={i} className="text-xs sm:text-sm text-gray-300 flex items-start gap-2.5 leading-relaxed">
                    <span className="text-emerald-400 font-bold mt-1 text-xs">▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Action Footer Card */}
        <div className="bg-gradient-to-r from-gray-900 via-emerald-950/40 to-gray-900 border border-emerald-500/30 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">Have a specific question about your KYC data?</h3>
            <p className="text-xs text-gray-400">
              Our compliance team is available 24/7 on WhatsApp and email for identity verification support.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/919999999999?text=Hello%20Rising%20Roots%20Compliance,%20I%20have%20a%20query%20regarding%20Privacy%20Policy%20and%20KYC."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <span>💬</span> Chat with Compliance Desk
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-8 py-8 text-center text-xs text-gray-500 space-y-2">
        <p>© 2026 Rising Roots Intelligence. All rights reserved.</p>
        <div className="flex justify-center gap-6 text-xs text-gray-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/about" className="hover:text-white">About Us</Link>
          <Link to="/history" className="hover:text-white">Track Record</Link>
          <Link to="/privacy" className="text-emerald-400 font-semibold">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-white">Query Desk</Link>
        </div>
      </footer>
    </div>
  );
}
