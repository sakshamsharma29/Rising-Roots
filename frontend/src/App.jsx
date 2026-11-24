import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Subscriptions from './pages/Subscriptions';
import Plans from './pages/Plans';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import UserPortal from './pages/UserPortal';
import TradeJournal from './pages/TradeJournal';
import Portfolio from './pages/Portfolio';
import AiAssistant from './pages/AiAssistant';
import TradingTerminal from './pages/TradingTerminal';
import OptionChain from './pages/OptionChain';
import VipSignals from './pages/VipSignals';
import TradeHistory from './pages/TradeHistory';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function ProtectedLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const authData = localStorage.getItem('rr_auth');
  if (!authData) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(authData);
  const isAdmin = user.role === 'admin';

  return (
    <div className="flex bg-gray-950 min-h-screen text-white font-sans antialiased">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenAddMember={() => setShowAddMemberModal(true)}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          {isAdmin ? (
            <Routes>
              <Route
                path="/"
                element={<Dashboard onOpenAddMember={() => setShowAddMemberModal(true)} />}
              />
              <Route
                path="/members"
                element={
                  <Members
                    searchTerm={searchTerm}
                    showAddModal={showAddMemberModal}
                    onCloseAddModal={() => setShowAddMemberModal(false)}
                  />
                }
              />
              <Route path="/terminal" element={<TradingTerminal />} />
              <Route path="/options" element={<OptionChain />} />
              <Route path="/signals" element={<VipSignals />} />
              <Route path="/history" element={<TradeHistory />} />
              <Route path="/trades" element={<TradeJournal searchTerm={searchTerm} />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/ai" element={<AiAssistant />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<UserPortal />} />
              <Route path="/terminal" element={<TradingTerminal />} />
              <Route path="/options" element={<OptionChain />} />
              <Route path="/signals" element={<VipSignals />} />
              <Route path="/history" element={<TradeHistory />} />
              <Route path="/trades" element={<TradeJournal searchTerm={searchTerm} />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/ai" element={<AiAssistant />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/history"
          element={
            <div className="bg-gray-950 min-h-screen text-white font-sans antialiased p-4 sm:p-8">
              <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-xl shadow-lg shadow-green-500/20">
                    RR
                  </div>
                  <div>
                    <span className="text-xl font-bold tracking-tight text-white">Rising Roots</span>
                    <span className="text-xs text-green-400 font-medium block -mt-1">Crypto & Forex Intelligence</span>
                  </div>
                </Link>

                <div className="flex items-center gap-3">
                  <Link
                    to="/"
                    className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-2"
                  >
                    ← Back to Home
                  </Link>
                  <Link
                    to="/login"
                    className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
                  >
                    Member Login →
                  </Link>
                </div>
              </div>
              <TradeHistory />
            </div>
          }
        />

        {/* Protected dashboard routes */}
        <Route path="/dashboard/*" element={<ProtectedLayout />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
