import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Header({ searchTerm, setSearchTerm, onOpenAddMember }) {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const isAdmin = user.role === 'admin';

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

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-300 flex items-center justify-center text-gray-950 font-bold text-sm">
            {getInitials()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-white truncate max-w-[150px]">{user.name || user.email || 'Admin Trader'}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role === 'admin' ? 'Owner / Admin' : 'Subscriber'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
