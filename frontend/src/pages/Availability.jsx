import React, { useState, useEffect } from 'react';
import { availabilityApi } from '../services/api';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const Availability = () => {
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMySlots();
    setDefaultTimes();
  }, []);

  const setDefaultTimes = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    const end = new Date(tomorrow);
    end.setHours(15, 0, 0, 0);

    setStartTime(tomorrow.toISOString().slice(0, 16));
    setEndTime(end.toISOString().slice(0, 16));
  };

  const loadMySlots = async () => {
    setLoading(true);
    try {
      const res = await availabilityApi.getMySlots();
      setMySlots(res.data);
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await availabilityApi.create({
        title,
        startTime,
        endTime,
      });
      setSuccess('Availability slot published! Other students can now book this slot on TiDB.');
      setTitle('');
      setDefaultTimes();
      loadMySlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish availability slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await availabilityApi.deleteSlot(id);
      loadMySlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Time Scheduling & Calendar</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Manage Your Availability
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Publish time slots when you're available to teach or mentor. Slots are visible to other students in the Discover portal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Slot Publishing Form */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add New Time Slot</span>
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Session Topic / Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React Hooks Deep Dive, SQL Tuning"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Slot'}</span>
            </button>
          </form>
        </div>

        {/* Existing Slots List */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>My Published Slots</span>
            </h2>
            <span className="text-xs text-slate-400">{mySlots.length} total slots</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading slots from TiDB...</div>
          ) : mySlots.length === 0 ? (
            <div className="py-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6">
              <p className="text-slate-400 text-xs">You have not published any availability slots yet.</p>
              <p className="text-slate-500 text-[11px] mt-1">Use the form on the left to set when you can tutor peers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{slot.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          slot.isBooked
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!slot.isBooked && (
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
