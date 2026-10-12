import React, { useState, useEffect } from 'react';
import { pointsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  Sparkles,
  ArrowUpRight,
  Gift,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

export const SwapPoints = () => {
  const { user, refreshUser } = useAuth();
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  useEffect(() => {
    loadPointsData();
  }, []);

  const loadPointsData = async () => {
    setLoading(true);
    try {
      const res = await pointsApi.getMyPoints();
      setPointsData(res.data);
    } catch (err) {
      console.error('Failed to load points data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    setClaiming(true);
    setClaimSuccess('');
    try {
      const res = await pointsApi.claimDaily();
      setPointsData(res.data);
      setClaimSuccess('+15 SwapPoints claimed for your daily learning streak!');
      refreshUser();
      setTimeout(() => setClaimSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Daily streak already claimed today.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span>SkillSwap Economy</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              SwapPoints Wallet & Ledger
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              SwapPoints power peer learning. Earn points by tutoring other students, completing learning milestones, and maintaining study streaks.
            </p>
          </div>

          {/* Balance Display */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 text-center min-w-[200px] glow-brand">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Balance
            </span>
            <div className="text-4xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1.5">
              <Coins className="w-8 h-8" />
              <span>{pointsData?.currentBalance ?? user?.swapPoints ?? 100}</span>
            </div>
            <span className="text-[11px] text-amber-400/80 font-medium">Available to spend</span>
          </div>
        </div>
      </div>

      {claimSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{claimSuccess}</span>
        </div>
      )}

      {/* Daily Claim & Earn Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Daily Learning Streak</h3>
              <span className="text-xs text-amber-400 font-semibold">+15 SP daily</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Log in daily to claim your continuous student engagement streak bonus.
          </p>
          <button
            onClick={handleClaimDaily}
            disabled={claiming}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : 'Claim Daily +15 SP'}
          </button>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Host a Tutoring Swap</h3>
              <span className="text-xs text-indigo-400 font-semibold">+50 SP per session</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Share knowledge in subjects you master. Points are awarded automatically when the session completes.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Attend a Learning Swap</h3>
              <span className="text-xs text-cyan-400 font-semibold">+20 SP per session</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Learn new skills from fellow university mentors. Active learners earn milestone points upon review.
          </p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>TiDB Transaction History</span>
          </h2>
          <span className="text-xs text-slate-400">Real database records</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading ledger from TiDB...</div>
        ) : pointsData?.history?.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No transactions recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {pointsData?.history?.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">{tx.description}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
                      {tx.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(tx.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold text-sm ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} SP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
