import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  BookOpen,
} from 'lucide-react';

export const Profile = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [learningInterests, setLearningInterests] = useState('');
  const [skills, setSkills] = useState([]);

  // New skill form fields
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState('TEACH');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillYears, setNewSkillYears] = useState(1);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setLearningInterests(user.learningInterests || '');
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    const skillObj = {
      skillName: newSkillName.trim(),
      type: newSkillType,
      level: newSkillLevel,
      category: newSkillCategory,
      yearsExperience: parseInt(newSkillYears, 10) || 1,
    };

    setSkills([...skills, skillObj]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await userApi.updateProfile({
        fullName,
        bio,
        avatarUrl,
        learningInterests,
        skills,
      });

      setSuccess('Profile updated successfully in TiDB!');
      refreshUser();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const teachSkills = skills.filter((s) => s.type === 'TEACH');
  const learnSkills = skills.filter((s) => s.type === 'LEARN');

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt={fullName}
              className="w-16 h-16 rounded-2xl border border-indigo-500/40 bg-slate-800"
            />
            <div>
              <h1 className="text-2xl font-black text-white">{fullName || 'Student Profile'}</h1>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {user?.role}
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">
                  {user?.swapPoints || 100} SwapPoints
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Basic Details */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Profile Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Avatar URL (Dicebear or custom image)
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Bio / Academic Background
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell fellow students about your major, interests, and what you enjoy mentoring..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Learning Interests (Keywords)
            </label>
            <input
              type="text"
              value={learningInterests}
              onChange={(e) => setLearningInterests(e.target.value)}
              placeholder="e.g. Next.js, Microservices, TiDB Cloud, UI Design"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Skill Management */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Skills Portfolio (Teach & Learn)</span>
            </h2>
            <span className="text-xs text-slate-400">{skills.length} skills added</span>
          </div>

          {/* Add Skill Row */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">Add Skill to Profile</span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Skill name (e.g. Python, React)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <select
                  value={newSkillType}
                  onChange={(e) => setNewSkillType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="TEACH">Can Teach</option>
                  <option value="LEARN">Want to Learn</option>
                </select>
              </div>

              <div>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Skills lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teaching */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Skills You Can Teach ({teachSkills.length})</span>
              </span>
              <div className="space-y-1.5">
                {teachSkills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No teaching skills added</p>
                ) : (
                  teachSkills.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{s.skillName}</span>
                        <span className="text-[11px] text-indigo-300 ml-2">({s.level})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skills.indexOf(s))}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Learning */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Skills You Want to Learn ({learnSkills.length})</span>
              </span>
              <div className="space-y-1.5">
                {learnSkills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No learning skills added</p>
                ) : (
                  learnSkills.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{s.skillName}</span>
                        <span className="text-[11px] text-cyan-300 ml-2">({s.level})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skills.indexOf(s))}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          {saving ? 'Saving changes to TiDB...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
