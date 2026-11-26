import React, { useEffect, useState } from 'react';

function Members({ searchTerm, showAddModal, onCloseAddModal }) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'pending'
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All'); // 'All' | 'Pending' | 'Verified' | 'Rejected'
  const [localSearch, setLocalSearch] = useState('');

  // KYC Review Modal State
  const [selectedKycMember, setSelectedKycMember] = useState(null);
  const [rejectionInput, setRejectionInput] = useState('');
  const [processingKyc, setProcessingKyc] = useState(false);

  // Form State for Adding New Member
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState('Pro Trader');
  const [newIdType, setNewIdType] = useState('PAN Card');
  const [newIdNumber, setNewIdNumber] = useState('');

  const query = searchTerm !== undefined ? searchTerm : localSearch;
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const token = localStorage.getItem('rr_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const fetchMembers = () => {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (statusFilter !== 'All') params.append('status', statusFilter);
    if (kycFilter !== 'All') params.append('kycStatus', kycFilter);

    fetch(`${API_URL}/api/members?${params.toString()}`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setMembers(resData.data);
      })
      .catch(() => {});
  };

  const fetchPendingRequests = () => {
    fetch(`${API_URL}/api/requests/pending`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setPendingRequests(resData.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMembers();
    fetchPendingRequests();
  }, [query, statusFilter, kycFilter]);

  const handleKycAction = async (memberId, kycStatus, reason = '') => {
    setProcessingKyc(true);
    try {
      const res = await fetch(`${API_URL}/api/members/${memberId}/kyc`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ kycStatus, rejectionReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
        if (selectedKycMember && (selectedKycMember.id === memberId || selectedKycMember._id === memberId)) {
          setSelectedKycMember((prev) => ({
            ...prev,
            kycStatus,
            kycRejectionReason: reason,
            kycVerifiedAt: kycStatus === 'Verified' ? new Date() : null,
          }));
        }
      }
    } catch (err) {
      console.error('Error updating KYC:', err);
    } finally {
      setProcessingKyc(false);
    }
  };

  const handleToggleStatus = (id) => {
    fetch(`${API_URL}/api/members/${id}/toggle`, { method: 'PATCH', headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          fetchMembers();
        }
      })
      .catch(() => {});
  };

  const handleApproveRequest = (id) => {
    fetch(`${API_URL}/api/requests/approve/${id}`, { method: 'POST', headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          fetchPendingRequests();
          fetchMembers();
        }
      })
      .catch(() => {});
  };

  const handleRejectRequest = (id) => {
    fetch(`${API_URL}/api/requests/reject/${id}`, { method: 'POST', headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          fetchPendingRequests();
        }
      })
      .catch(() => {});
  };

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const payload = {
      name: newName,
      email: newEmail,
      plan: newPlan,
      status: 'Active',
      idType: newIdType,
      idNumber: newIdNumber,
      kycStatus: newIdNumber ? 'Verified' : 'Pending',
    };

    fetch(`${API_URL}/api/members`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          fetchMembers();
        }
      })
      .catch(() => {});

    setNewName('');
    setNewEmail('');
    setNewIdNumber('');
    if (onCloseAddModal) onCloseAddModal();
  };

  return (
    <div className="space-y-6">
      {/* Title Bar & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold">Community Members & Applicants</h1>
          <p className="text-gray-400 text-sm mt-1">Manage team members, subscription statuses, and prospective applicant join requests.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'directory' ? 'bg-green-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Member Directory ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending' ? 'bg-green-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="bg-amber-400 text-gray-950 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="text-gray-400 font-semibold mr-1">Status:</span>
              {['All', 'Active', 'Expired'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === st ? 'bg-green-500 text-gray-950 font-bold shadow' : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {st}
                </button>
              ))}

              <span className="text-gray-600 mx-1">|</span>

              <span className="text-gray-400 font-semibold mr-1">Govt ID / KYC:</span>
              {[
                { id: 'All', label: 'All KYC' },
                { id: 'Pending', label: '⏳ Pending' },
                { id: 'Verified', label: '✓ Verified' },
                { id: 'Rejected', label: '✕ Rejected' },
              ].map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKycFilter(k.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    kycFilter === k.id
                      ? 'bg-emerald-500 text-gray-950 font-bold shadow'
                      : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-400 font-mono">
              Team Code: <span className="text-green-400 font-bold">RR-ALPHA-2026</span>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase text-xs border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Subscriber</th>
                    <th className="py-3.5 px-4 font-semibold">Phone / WhatsApp</th>
                    <th className="py-3.5 px-4 font-semibold">Govt ID & KYC</th>
                    <th className="py-3.5 px-4 font-semibold">Telegram / Location</th>
                    <th className="py-3.5 px-4 font-semibold">Plan & Focus</th>
                    <th className="py-3.5 px-4 font-semibold">Account</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {members.map((m) => (
                    <tr key={m.id || m._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{m.name}</div>
                        <div className="text-xs font-mono text-gray-400">{m.email}</div>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono">
                        {m.phone ? (
                          <a
                            href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold"
                            title="Chat on WhatsApp"
                          >
                            <span>💬</span>
                            <span>{m.phone}</span>
                          </a>
                        ) : (
                          <span className="text-gray-600">Not provided</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs font-mono">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            m.kycStatus === 'Verified'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : m.kycStatus === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                          }`}>
                            {m.kycStatus === 'Verified' ? '✓ Verified' : m.kycStatus === 'Rejected' ? '✕ Rejected' : '⏳ Pending'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold bg-gray-950 px-1.5 py-0.5 rounded border border-gray-800">
                            {m.idType || 'PAN Card'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-300 font-bold mb-1.5">
                          {m.idNumber ? `${m.idNumber.substring(0, 4)}••••${m.idNumber.slice(-2)}` : 'ID Number Pending'}
                        </div>
                        <button
                          onClick={() => setSelectedKycMember(m)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                        >
                          <span>📄</span> View ID Proof & Audit
                        </button>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {m.telegramUsername ? (
                          <div className="text-blue-400 font-mono font-medium">{m.telegramUsername}</div>
                        ) : (
                          <div className="text-gray-600">No Telegram</div>
                        )}
                        <div className="text-gray-400 text-[11px] mt-0.5">{m.city || 'Location N/A'}</div>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="text-gray-200 font-semibold">{m.plan}</div>
                        <div className="text-emerald-400 text-[11px]">{m.preferredMarket || 'All Markets'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          onClick={() => handleToggleStatus(m.id || m._id)}
                          className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            m.status === 'Active'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedKycMember(m)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                          >
                            Review KYC
                          </button>
                          <span className="text-gray-600">·</span>
                          <button
                            onClick={() => handleToggleStatus(m.id || m._id)}
                            className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Toggle Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Pending Requests View */
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-1">Pending Applicant Join Requests</h3>
          <p className="text-xs text-gray-400 mb-6">Review and approve prospective traders requesting to join your team desk.</p>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <span className="text-3xl">📥</span>
              <p className="text-sm text-gray-400 font-medium">No pending join requests.</p>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Share your Team Invite Code <code className="text-green-400 font-bold">RR-ALPHA-2026</code> with applicants to accept join requests.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div key={req.id || req._id} className="bg-gray-950 border border-gray-800 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{req.name}</h4>
                      <p className="text-xs text-gray-400 font-mono">{req.email}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>

                  <div className="text-xs text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800 space-y-1">
                    <div><span className="text-gray-500">Preferred Tier:</span> <span className="text-white font-bold">{req.preferredPlan}</span></div>
                    {req.message && <div><span className="text-gray-500">Note:</span> "{req.message}"</div>}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => handleRejectRequest(req.id || req._id)}
                      className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveRequest(req.id || req._id)}
                      className="bg-green-500 hover:bg-green-400 text-gray-950 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Approve & Activate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Add Community Member</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Plan Tier</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="Pro Trader">Pro Trader</option>
                  <option value="VIP Signals & Mentorship">VIP Signals & Mentorship</option>
                  <option value="Community Pass">Community Pass</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Govt ID Type</label>
                  <select
                    value={newIdType}
                    onChange={(e) => setNewIdType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="PAN Card">PAN Card</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Govt ID Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={newIdNumber}
                    onChange={(e) => setNewIdNumber(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Review & Document Audit Modal */}
      {selectedKycMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <h3 className="text-xl font-bold text-white">Government ID & KYC Audit</h3>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">FIU-IND & AML Identity Verification Portal</p>
              </div>
              <button
                onClick={() => { setSelectedKycMember(null); setRejectionInput(''); }}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Member Summary Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-950/80 rounded-2xl border border-gray-800/80 mb-5">
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Applicant Name</div>
                <div className="text-base font-bold text-white mt-0.5">{selectedKycMember.name}</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">{selectedKycMember.email}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Verification Status</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    selectedKycMember.kycStatus === 'Verified'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : selectedKycMember.kycStatus === 'Rejected'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {selectedKycMember.kycStatus === 'Verified' ? '✓ Verified' : selectedKycMember.kycStatus === 'Rejected' ? '✕ Rejected' : '⏳ Pending Audit'}
                  </span>
                  {selectedKycMember.phone && (
                    <a
                      href={`https://wa.me/${selectedKycMember.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div className="mb-5 space-y-4">
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Document Type:</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {selectedKycMember.idType || 'PAN Card'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Official Document ID:</span>
                  <span className="text-sm font-mono font-bold text-white tracking-widest bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
                    {selectedKycMember.idNumber || 'No ID Number Submitted'}
                  </span>
                </div>
                {selectedKycMember.kycRejectionReason && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <span className="font-bold">Prior Rejection Reason:</span> {selectedKycMember.kycRejectionReason}
                  </div>
                )}
              </div>

              {/* Scanned ID Proof Documents */}
              <div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Uploaded Proof Documents</span>
                  <span className="text-[11px] text-gray-500 lowercase">Click photo to open full resolution</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Front Side */}
                  <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
                    <div className="text-xs font-bold text-gray-300 mb-2 flex items-center justify-between">
                      <span>Front Side Photo</span>
                      {selectedKycMember.idDocumentUrl && (
                        <a
                          href={selectedKycMember.idDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline font-semibold"
                        >
                          Open ↗
                        </a>
                      )}
                    </div>
                    {selectedKycMember.idDocumentUrl ? (
                      <a href={selectedKycMember.idDocumentUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectedKycMember.idDocumentUrl}
                          alt="ID Front Document"
                          className="w-full h-44 object-contain rounded-xl bg-black border border-gray-800 hover:opacity-90 transition cursor-zoom-in"
                        />
                      </a>
                    ) : (
                      <div className="h-44 rounded-xl border border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-600 text-xs text-center p-4">
                        <span className="text-2xl mb-1">📭</span>
                        No front photo uploaded
                      </div>
                    )}
                  </div>

                  {/* Back Side */}
                  <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
                    <div className="text-xs font-bold text-gray-300 mb-2 flex items-center justify-between">
                      <span>Back Side (Aadhaar / DL)</span>
                      {selectedKycMember.idDocumentBackUrl && (
                        <a
                          href={selectedKycMember.idDocumentBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline font-semibold"
                        >
                          Open ↗
                        </a>
                      )}
                    </div>
                    {selectedKycMember.idDocumentBackUrl ? (
                      <a href={selectedKycMember.idDocumentBackUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectedKycMember.idDocumentBackUrl}
                          alt="ID Back Document"
                          className="w-full h-44 object-contain rounded-xl bg-black border border-gray-800 hover:opacity-90 transition cursor-zoom-in"
                        />
                      </a>
                    ) : (
                      <div className="h-44 rounded-xl border border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-600 text-xs text-center p-4">
                        <span className="text-2xl mb-1">📄</span>
                        {selectedKycMember.idType === 'Aadhaar Card' || selectedKycMember.idType === 'Driving License'
                          ? 'Back side not uploaded'
                          : 'Not required for PAN / Passport'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Audit Actions */}
            <div className="pt-4 border-t border-gray-800">
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Rejection Reason (only needed if declining):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Document photo is blurry, expired ID, or name does not match profile"
                  value={rejectionInput}
                  onChange={(e) => setRejectionInput(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setSelectedKycMember(null); setRejectionInput(''); }}
                  className="w-full sm:w-auto px-4 py-2 text-xs text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={processingKyc}
                  onClick={() => handleKycAction(selectedKycMember.id || selectedKycMember._id, 'Rejected', rejectionInput || 'Document verification failed')}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition disabled:opacity-50 cursor-pointer"
                >
                  ✕ Reject KYC
                </button>
                <button
                  type="button"
                  disabled={processingKyc}
                  onClick={() => handleKycAction(selectedKycMember.id || selectedKycMember._id, 'Verified')}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-gray-950 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {processingKyc ? 'Updating...' : '✓ Approve & Verify KYC'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;