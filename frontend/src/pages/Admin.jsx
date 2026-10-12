import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  ShieldCheck,
  Users,
  Calendar,
  MessageSquare,
  Sparkles,
  Clock,
  Database,
  CheckCircle,
} from 'lucide-react';

export const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-950">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Platform System Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time analytics and student activity audit backed by TiDB Cloud distributed SQL cluster.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading system stats from TiDB...</div>
      ) : !stats ? (
        <div className="p-8 rounded-3xl glass-panel text-center text-slate-400">
          Unauthorized or unable to retrieve administrative metrics.
        </div>
      ) : (
        <>
          {/* Counters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">Total Students</span>
              <div className="text-3xl font-black text-white mt-1">{stats.totalUsers}</div>
              <div className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>TiDB Users Table</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">Learning Sessions</span>
              <div className="text-3xl font-black text-cyan-400 mt-1">{stats.totalSessions}</div>
              <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Peer Bookings</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">Exchange Requests</span>
              <div className="text-3xl font-black text-purple-400 mt-1">{stats.totalRequests}</div>
              <div className="text-[10px] text-purple-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Peer Handshakes</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">STOMP Messages</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">{stats.totalMessages}</div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>Persisted in DB</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">Available Slots</span>
              <div className="text-3xl font-black text-amber-400 mt-1">{stats.activeAvailabilities}</div>
              <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Open for Booking</span>
              </div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Registered Students Directory</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold uppercase tracking-wider">Student</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Email</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Role</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">SwapPoints</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recentUsers?.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 flex items-center gap-2.5 font-semibold text-white">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`}
                          alt={u.fullName}
                          className="w-7 h-7 rounded-full bg-slate-800"
                        />
                        <span>{u.fullName}</span>
                      </td>
                      <td className="py-3 text-slate-400">{u.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-amber-400">{u.swapPoints} SP</td>
                      <td className="py-3 text-slate-400">{u.subscriptionPlan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
