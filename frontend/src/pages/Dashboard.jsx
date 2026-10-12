import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skillRequestApi, sessionApi, messageApi } from '../services/api';
import {
  Coins,
  Calendar,
  MessageSquare,
  Compass,
  ArrowRight,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  Dna,
  Award,
  Sparkles,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [reqRes, sessRes, unreadRes] = await Promise.all([
        skillRequestApi.getReceived(),
        sessionApi.getMySessions(),
        messageApi.getUnreadCount(),
      ]);
      setReceivedRequests(reqRes.data);
      setSessions(sessRes.data);
      setUnreadCount(unreadRes.data.unreadCount || 0);
      refreshUser();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await skillRequestApi.accept(id);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await skillRequestApi.reject(id);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const pendingRequests = receivedRequests.filter((r) => r.status === 'PENDING');
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'CONFIRMED' || s.status === 'REQUESTED'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-900/50 to-slate-950/80">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Student Skill Exchange Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hello, <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">{user?.fullName || 'Student'}</span>!
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Exchange your skills directly with peers. Learn what you need, teach what you love, and build your verified Skill Passport.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/discover"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Peers</span>
            </Link>
            <Link
              to="/availability"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Publish Slots</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">SwapPoints</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white">{user?.swapPoints ?? 100}</div>
            <Link to="/points" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-1">
              <span>View transaction log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Sessions</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white">{upcomingSessions.length}</div>
            <Link to="/sessions" className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1">
              <span>Manage bookings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Incoming Requests</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white">{pendingRequests.length}</div>
            <span className="text-xs text-slate-400">Awaiting your response</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unread Messages</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white">{unreadCount}</div>
            <Link to="/messages" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1">
              <span>Open live chat</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incoming Exchange Requests */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Pending Exchange Requests</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">{pendingRequests.length} pending</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading requests from TiDB...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6">
              <p className="text-slate-400 text-sm">No incoming exchange requests right now.</p>
              <Link to="/discover" className="inline-block mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Explore student profiles & initiate an exchange →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{req.senderName}</span>
                      <span className="text-xs text-slate-500">wants to learn</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                        {req.requestedSkill}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Offers in exchange:{' '}
                      <span className="text-cyan-300 font-medium">{req.offeredSkill}</span>
                    </div>
                    {req.message && (
                      <p className="text-xs text-slate-400 italic mt-1 line-clamp-1">"{req.message}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Learning Sessions */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>Upcoming Learning Sessions</span>
            </h2>
            <Link to="/sessions" className="text-xs text-cyan-400 hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading sessions from TiDB...</div>
          ) : upcomingSessions.length === 0 ? (
            <div className="py-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6">
              <p className="text-slate-400 text-sm">You have no upcoming sessions booked.</p>
              <Link to="/discover" className="inline-block mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                Browse student mentors & book a session →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 4).map((sess) => {
                const isMentor = sess.mentorId === user?.id;
                const partnerName = isMentor ? sess.learnerName : sess.mentorName;
                const roleLabel = isMentor ? 'Mentoring' : 'Learning from';

                return (
                  <div key={sess.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{sess.skillName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sess.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {sess.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {roleLabel} <span className="text-slate-200 font-medium">{partnerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(sess.startTime).toLocaleString()}</span>
                      </div>
                    </div>

                    {sess.meetingLink && sess.status === 'CONFIRMED' && (
                      <a
                        href={sess.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Link
          to="/skill-dna"
          className="group p-6 rounded-3xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Dna className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Skill DNA Analysis</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm">
              Explore your personal skill balance, strengths, and personalized growth recommendations.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/skill-passport"
          className="group p-6 rounded-3xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Award className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Skill Passport & Achievements</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm">
              Access your digital learning credentials, verified peer reviews, and milestone badges.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};
