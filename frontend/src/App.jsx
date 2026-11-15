import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/login" element={<AuthPage />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard/*" element={<ProtectedLayout />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
