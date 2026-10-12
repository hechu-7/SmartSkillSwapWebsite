import React, { useState, useEffect } from 'react';
import { skillPassportApi } from '../services/api';
import {
  Award,
  ShieldCheck,
  Star,
  CheckCircle,
  Calendar,
  Sparkles,
  QrCode,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const SkillPassport = () => {
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPassport();
  }, []);

  const loadPassport = async () => {
    setLoading(true);
    try {
      const res = await skillPassportApi.getMyPassport();
      setPassport(res.data);
    } catch (err) {
      console.error('Failed to load Skill Passport', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-cyan-950/40 via-indigo-950/20 to-slate-950/80">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Verifiable Academic Passport</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Official Skill Passport
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Your verified peer-learning credential. Completed student sessions, peer feedback, and competencies are cryptographically signed on TiDB.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading verified passport from TiDB...</div>
      ) : !passport ? (
        <div className="p-8 rounded-3xl glass-panel text-center text-slate-400">
          Unable to retrieve passport details.
        </div>
      ) : (
        <>
          {/* Digital Credential Identity Card */}
          <div className="rounded-3xl glass-panel border border-cyan-500/30 p-6 sm:p-8 relative overflow-hidden glow-teal">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              {/* User Identity Info */}
              <div className="flex items-center gap-4">
                <img
                  src={passport.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${passport.email}`}
                  alt={passport.fullName}
                  className="w-20 h-20 rounded-2xl border-2 border-cyan-400/50 bg-slate-800 shadow-xl"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white">{passport.fullName}</h2>
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-xs text-slate-300">{passport.email}</p>
                  <p className="text-[11px] text-slate-400">Member since {passport.memberSince}</p>
                </div>
              </div>

              {/* Metrics Pills */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-2xl font-black text-cyan-400">{passport.completedSessionsCount}</div>
                  <div className="text-[10px] font-semibold uppercase text-slate-400">Completed Swaps</div>
                </div>

                <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>{passport.averageRating || '5.0'}</span>
                  </div>
                  <div className="text-[10px] font-semibold uppercase text-slate-400">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Verification Code Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-semibold text-slate-300">Credential ID:</span>
                <span className="code-font text-cyan-400 text-[11px] select-all bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {passport.passportVerificationCode}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Verified in TiDB Distributed Cluster</span>
              </div>
            </div>
          </div>

          {/* Achievement Badges Section */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Earned Milestone Badges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {passport.achievements?.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    ach.isUnlocked
                      ? 'bg-slate-900/80 border-indigo-500/30'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ach.isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {ach.isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-3">{ach.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
                  <div className="text-[10px] text-slate-500 mt-2">{ach.unlockedDate}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Reviews & Verified Feedback */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Peer Ratings & Reviews</span>
            </h3>

            {passport.feedbacks?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No reviews recorded yet. Complete a learning session to receive verified peer feedback.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {passport.feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={fb.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fb.authorName}`}
                          alt={fb.authorName}
                          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                        />
                        <span className="font-semibold text-xs text-white">{fb.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(fb.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic pl-10 leading-relaxed">
                      "{fb.comment}"
                    </p>
                    <div className="text-[10px] text-slate-500 text-right">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
