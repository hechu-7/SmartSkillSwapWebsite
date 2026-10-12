import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Sparkles, Coins, LogOut, Bell, Wifi, WifiOff } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { connected, incomingNotification, clearNotification } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 glow-brand transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  SkillSwap
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  TiDB Cloud
                </span>
              </div>
            </Link>
          </div>

          {/* User Status & Controls */}
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* WebSocket Live Connection Pill */}
              <div
                title={connected ? "Real-time WebSocket connected" : "Connecting to real-time broker..."}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  connected
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                {connected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Synced</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Reconnecting</span>
                  </>
                )}
              </div>

              {/* SwapPoints Badge */}
              <Link
                to="/points"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors text-sm font-semibold"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{user.swapPoints ?? 100}</span>
                <span className="hidden sm:inline text-xs font-normal text-amber-400/80">SP</span>
              </Link>

              {/* User Identity Chip */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full border border-indigo-500/40 bg-slate-800"
                />
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-slate-100 line-clamp-1">{user.fullName}</div>
                  <div className="text-slate-400 text-[11px] line-clamp-1">{user.email}</div>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Real-time Notification Banner */}
      {incomingNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-xl glass-panel border border-indigo-500/40 shadow-2xl shadow-indigo-950 animate-slide-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Live Notification</h4>
                <p className="text-xs text-slate-300 mt-0.5">{incomingNotification.message}</p>
              </div>
            </div>
            <button
              onClick={clearNotification}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
