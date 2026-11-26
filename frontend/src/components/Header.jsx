import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Header({ searchTerm, setSearchTerm, onOpenAddMember }) {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('rr_token');
    localStorage.removeItem('rr_auth');
    navigate('/login');
  };

  // Get initials for avatar
  const getInitials = () => {
    if (user.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return 'RR';
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (setSearchTerm) setSearchTerm(val);

    // Auto-navigate to search results page if user starts typing on other pages
    if (val.trim().length > 0) {
      if (isAdmin && !location.pathname.includes('/members')) {
        navigate('/dashboard/members');
      } else if (!isAdmin && !location.pathname.includes('/trades')) {
        navigate('/dashboard/trades');
      }
    }
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Search Bar with Autocomplete Off & Smart Navigation */}
      <div className="flex items-center gap-3 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 w-96">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="header_search_input"
          name="search_query"
          type="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={isAdmin ? "Search members by name, email, or plan..." : "Search trades by symbol (e.g. RELIANCE)..."}
          value={searchTerm || ''}
          onChange={handleSearchChange}
          className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-gray-500"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {isAdmin && (
          <button
            onClick={onOpenAddMember}
            className="bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        )}

        <div className="h-6 w-px bg-gray-800"></div>

        {/* User Profile - Clickable to open Profile */}
        <button
          onClick={() => navigate('/dashboard/profile')}
          title="Click to view & edit your profile"
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-800/80 transition-all cursor-pointer group text-left border border-transparent hover:border-gray-700/60"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-300 flex items-center justify-center text-gray-950 font-bold text-sm shadow group-hover:scale-105 transition-transform">
            {getInitials()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-white truncate max-w-[150px] group-hover:text-emerald-400 transition-colors">
              {user.name || user.email || 'Admin Trader'}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user.role === 'admin' ? 'Owner / Admin' : 'Subscriber'}
            </p>
          </div>
          <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 transition-colors hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Prominent Upper Right Logout */}
        <button
          onClick={handleLogout}
          title="Sign out of account"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 border border-gray-700 hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
