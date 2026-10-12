import React, { useState, useEffect } from 'react';
import { sessionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Coins,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const Sessions = () => {
  const { user, refreshUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'UPCOMING', 'COMPLETED'

  // Feedback modal
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await sessionApi.getMySessions();
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await sessionApi.accept(id);
      setActionSuccess('Session confirmed! Meeting link generated.');
      setTimeout(() => setActionSuccess(''), 3000);
      loadSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept session');
    }
  };

  const handleReject = async (id) => {
    try {
      await sessionApi.reject(id);
      loadSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject session');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await sessionApi.cancel(id);
      loadSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel session');
    }
  };

  const handleComplete = async (id) => {
    try {
      await sessionApi.complete(id);
      setActionSuccess('Session completed! SwapPoints credited to mentor.');
      setTimeout(() => setActionSuccess(''), 4000);
      refreshUser();
      loadSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete session');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackSession) return;
    setSubmittingFeedback(true);
    try {
      const recipientId =
        feedbackSession.mentorId === user.id
          ? feedbackSession.learnerId
          : feedbackSession.mentorId;

      await sessionApi.submitFeedback({
        sessionId: feedbackSession.id,
        recipientId,
        rating,
        comment,
      });

      setFeedbackSession(null);
      setComment('');
      setActionSuccess('Review submitted! Saved to partner\'s Skill Passport.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'UPCOMING') return s.status === 'CONFIRMED' || s.status === 'REQUESTED';
    if (activeTab === 'COMPLETED') return s.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Learning Schedule & Bookings</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Learning Sessions
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your confirmed 1-on-1 swaps, accept student requests, and join video meeting rooms.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            {['ALL', 'UPCOMING', 'COMPLETED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Sessions List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading sessions from TiDB...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center border border-slate-800 space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No sessions found in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Book learning sessions from the Discover page or share your availability slots.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSessions.map((session) => {
            const isMentor = session.mentorId === user?.id;
            const partnerName = isMentor ? session.learnerName : session.mentorName;
            const partnerEmail = isMentor ? session.learnerEmail : session.mentorEmail;
            const partnerAvatar = isMentor ? session.learnerAvatar : session.mentorAvatar;

            return (
              <div
                key={session.id}
                className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        session.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : session.status === 'COMPLETED'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : session.status === 'REQUESTED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {session.status}
                    </span>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                      {isMentor ? 'You are Mentor' : 'You are Learner'}
                    </span>
                  </div>

                  {/* Skill & Time */}
                  <div>
                    <h3 className="text-lg font-bold text-white">{session.skillName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{new Date(session.startTime).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Partner info */}
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                    <img
                      src={partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerEmail}`}
                      alt={partnerName}
                      className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">{partnerName}</div>
                      <div className="text-[11px] text-slate-400">{partnerEmail}</div>
                    </div>
                  </div>

                  {session.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                      "{session.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  {/* Confirmed meeting link */}
                  {session.status === 'CONFIRMED' && (
                    <div className="flex items-center gap-2">
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Video Room</span>
                      </a>
                      <button
                        onClick={() => handleComplete(session.id)}
                        className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold text-xs border border-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    </div>
                  )}

                  {/* Mentor incoming request actions */}
                  {session.status === 'REQUESTED' && isMentor && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(session.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept Booking</span>
                      </button>
                      <button
                        onClick={() => handleReject(session.id)}
                        className="py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs border border-rose-500/30 transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {/* Completed session review */}
                  {session.status === 'COMPLETED' && (
                    <button
                      onClick={() => setFeedbackSession(session)}
                      className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-xs border border-indigo-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Write Peer Review & Rating</span>
                    </button>
                  )}

                  {/* Cancellation if not completed */}
                  {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && session.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleCancel(session.id)}
                      className="w-full text-center text-[11px] text-slate-500 hover:text-rose-400 transition-colors pt-1"
                    >
                      Cancel booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Peer Feedback & Rating Modal */}
      {feedbackSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Submit Session Review</span>
            </h3>
            <p className="text-xs text-slate-400">
              Your feedback is recorded in TiDB and verified on their Skill Passport.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-slate-600'}`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-amber-400 ml-2">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Written Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What went well? How was the teaching style?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackSession(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {submittingFeedback ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
