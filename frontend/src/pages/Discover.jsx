import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, skillRequestApi, sessionApi, availabilityApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Sparkles,
  MessageSquare,
  Calendar,
  Star,
  CheckCircle,
  X,
  Compass,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [exchangeModalUser, setExchangeModalUser] = useState(null);
  const [requestedSkill, setRequestedSkill] = useState('');
  const [offeredSkill, setOfferedSkill] = useState('');
  const [exchangeMessage, setExchangeMessage] = useState('');
  const [exchangeSubmitting, setExchangeSubmitting] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [modalErrorMsg, setModalErrorMsg] = useState('');

  // Booking Modal
  const [bookingModalUser, setBookingModalUser] = useState(null);
  const [userSlots, setUserSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookingSkillName, setBookingSkillName] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const categories = ['All', 'Programming', 'Data Science', 'Frontend', 'Backend', 'Design', 'Languages', 'Academics'];

  useEffect(() => {
    fetchDiscoveredUsers();
  }, [selectedCategory]);

  const fetchDiscoveredUsers = async (query = searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await userApi.discover({
        query: query || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load peers from TiDB. Please verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDiscoveredUsers(searchQuery);
  };

  const openExchangeModal = (targetUser) => {
    setExchangeModalUser(targetUser);
    setModalSuccessMsg('');
    setModalErrorMsg('');
    setRequestedSkill(targetUser.teachSkills?.[0]?.skillName || '');
    setOfferedSkill(user?.skills?.find((s) => s.type === 'TEACH')?.skillName || 'Web Basics');
    setExchangeMessage(`Hi ${targetUser.fullName}, I'd love to learn ${targetUser.teachSkills?.[0]?.skillName || 'skills'} from you and share my experience in exchange!`);
  };

  const handleSendExchangeRequest = async (e) => {
    e.preventDefault();
    setExchangeSubmitting(true);
    setModalErrorMsg('');
    try {
      await skillRequestApi.create({
        recipientId: exchangeModalUser.id,
        requestedSkill,
        offeredSkill,
        message: exchangeMessage,
      });
      setModalSuccessMsg('Exchange request sent successfully! The recipient has been notified.');
      setTimeout(() => {
        setExchangeModalUser(null);
        setModalSuccessMsg('');
      }, 2000);
    } catch (err) {
      setModalErrorMsg(err.response?.data?.message || 'Failed to send exchange request.');
    } finally {
      setExchangeSubmitting(false);
    }
  };

  const openBookingModal = async (targetUser) => {
    setBookingModalUser(targetUser);
    setBookingSkillName(targetUser.teachSkills?.[0]?.skillName || 'Peer Mentoring');
    setModalSuccessMsg('');
    setModalErrorMsg('');
    try {
      const res = await availabilityApi.getUserSlots(targetUser.id);
      const openSlots = res.data.filter((s) => !s.isBooked && new Date(s.endTime) > new Date());
      setUserSlots(openSlots);
      if (openSlots.length > 0) {
        setSelectedSlotId(openSlots[0].id.toString());
        setBookingStartTime(openSlots[0].startTime);
        setBookingEndTime(openSlots[0].endTime);
      } else {
        // Fallback default: tomorrow 3 PM to 4 PM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(15, 0, 0, 0);
        const end = new Date(tomorrow);
        end.setHours(16, 0, 0, 0);
        setBookingStartTime(tomorrow.toISOString().slice(0, 16));
        setBookingEndTime(end.toISOString().slice(0, 16));
      }
    } catch (err) {
      setUserSlots([]);
    }
  };

  const handleSlotSelect = (slotId) => {
    setSelectedSlotId(slotId);
    const slot = userSlots.find((s) => s.id.toString() === slotId);
    if (slot) {
      setBookingStartTime(slot.startTime);
      setBookingEndTime(slot.endTime);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setModalErrorMsg('');
    try {
      await sessionApi.book({
        mentorId: bookingModalUser.id,
        availabilityId: selectedSlotId ? parseInt(selectedSlotId, 10) : undefined,
        skillName: bookingSkillName,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        notes: bookingNotes,
      });
      setModalSuccessMsg('Session booked successfully! Awaiting mentor confirmation.');
      setTimeout(() => {
        setBookingModalUser(null);
        setModalSuccessMsg('');
      }, 2000);
    } catch (err) {
      setModalErrorMsg(err.response?.data?.message || 'Failed to book session.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Search Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Peer Discovery Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Discover Student Mentors & Peers
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Connect directly with real university students. Compatibility scores are computed dynamically from matching skill profiles.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, skill (e.g. Python, React), or topic..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Categories Tab Strip */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Results */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Querying registered students from TiDB Cloud...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No matching students found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords or clear the category filter. New students appear as soon as they register.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              fetchDiscoveredUsers('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold transition-all inline-block mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((peer) => (
            <div
              key={peer.id}
              className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all"
            >
              <div>
                {/* Header: Avatar, Name, Compatibility Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={peer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${peer.email}`}
                      alt={peer.fullName}
                      className="w-12 h-12 rounded-2xl border border-indigo-500/30 bg-slate-800 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{peer.fullName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-semibold">{peer.averageRating || '5.0'}</span>
                        <span className="text-slate-500 text-[11px]">({peer.completedSessionsCount || 0} swaps)</span>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{peer.compatibilityScore}%</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Compatibility</div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {peer.bio || 'Eager to exchange skills and learn with fellow university peers.'}
                </p>

                {/* Skills Can Teach */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Can Teach:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.teachSkills?.length > 0 ? (
                      peer.teachSkills.map((s) => (
                        <span
                          key={s.id || s.skillName}
                          className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                        >
                          {s.skillName} <span className="text-[10px] text-indigo-400/70">({s.level})</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None listed yet</span>
                    )}
                  </div>
                </div>

                {/* Wants to Learn */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wants to Learn:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.learnSkills?.length > 0 ? (
                      peer.learnSkills.map((s) => (
                        <span
                          key={s.id || s.skillName}
                          className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium"
                        >
                          {s.skillName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Open to all subjects</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => openExchangeModal(peer)}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Exchange</span>
                </button>

                <button
                  onClick={() => openBookingModal(peer)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                  title="Book 1-on-1 Session"
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Book</span>
                </button>

                <button
                  onClick={() => navigate(`/messages?partnerId=${peer.id}`)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                  title="Direct Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exchange Request Modal */}
      {exchangeModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-slate-800 p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Skill Exchange Request</h3>
                  <p className="text-xs text-slate-400">With {exchangeModalUser.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setExchangeModalUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            {modalErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendExchangeRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Skill you want to learn from {exchangeModalUser.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  placeholder="e.g. Python, Machine Learning, React"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Skill you offer to teach in exchange
                </label>
                <input
                  type="text"
                  required
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  placeholder="e.g. UI/UX Design, TypeScript, Java"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Message / Introduction
                </label>
                <textarea
                  rows={3}
                  value={exchangeMessage}
                  onChange={(e) => setExchangeMessage(e.target.value)}
                  placeholder="Introduce yourself and propose topics you want to cover..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setExchangeModalUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={exchangeSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {exchangeSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-slate-800 p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Book Learning Session</h3>
                  <p className="text-xs text-slate-400">With {bookingModalUser.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setBookingModalUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            {modalErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Topic / Skill to Focus On
                </label>
                <input
                  type="text"
                  required
                  value={bookingSkillName}
                  onChange={(e) => setBookingSkillName(e.target.value)}
                  placeholder="e.g. Distributed SQL on TiDB, PyTorch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Published Slots selection if available */}
              {userSlots.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Select Mentor's Published Slot
                  </label>
                  <select
                    value={selectedSlotId}
                    onChange={(e) => handleSlotSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {userSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bookingStartTime}
                      onChange={(e) => setBookingStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bookingEndTime}
                      onChange={(e) => setBookingEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Notes / Goals for the Session
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Questions you want answered, files or repo to review..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingModalUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Booking...' : 'Confirm Session Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
