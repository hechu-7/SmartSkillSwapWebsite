import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Discover } from './pages/Discover';
import { Messages } from './pages/Messages';
import { Sessions } from './pages/Sessions';
import { Availability } from './pages/Availability';
import { SkillDNA } from './pages/SkillDNA';
import { SkillPassport } from './pages/SkillPassport';
import { SwapPoints } from './pages/SwapPoints';
import { Subscription } from './pages/Subscription';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading SkillSwap...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      <Navbar />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/discover"
              element={
                <ProtectedLayout>
                  <Discover />
                </ProtectedLayout>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedLayout>
                  <Messages />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedLayout>
                  <Sessions />
                </ProtectedLayout>
              }
            />
            <Route
              path="/availability"
              element={
                <ProtectedLayout>
                  <Availability />
                </ProtectedLayout>
              }
            />
            <Route
              path="/skill-dna"
              element={
                <ProtectedLayout>
                  <SkillDNA />
                </ProtectedLayout>
              }
            />
            <Route
              path="/skill-passport"
              element={
                <ProtectedLayout>
                  <SkillPassport />
                </ProtectedLayout>
              }
            />
            <Route
              path="/points"
              element={
                <ProtectedLayout>
                  <SwapPoints />
                </ProtectedLayout>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedLayout>
                  <Subscription />
                </ProtectedLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedLayout>
                  <Admin />
                </ProtectedLayout>
              }
            />

            {/* Default Catch-all */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
