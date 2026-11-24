import React, { useEffect, useState } from 'react';

function Members({ searchTerm, showAddModal, onCloseAddModal }) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'pending'
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  // Form State for Adding New Member
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState('Pro Trader');

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
  }, [query, statusFilter]);

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

    const payload = { name: newName, email: newEmail, plan: newPlan, status: 'Active' };

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
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-semibold">Filter Status:</span>
              {['All', 'Active', 'Expired'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    statusFilter === st ? 'bg-green-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {st}
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
                    <th className="py-3.5 px-4 font-semibold">Telegram / Location</th>
                    <th className="py-3.5 px-4 font-semibold">Plan & Focus</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
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
                        <button
                          onClick={() => handleToggleStatus(m.id || m._id)}
                          className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Toggle Status
                        </button>
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
    </div>
  );
}

export default Members;