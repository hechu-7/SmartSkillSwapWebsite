import React, { useState, useEffect } from 'react';
import { skillDnaApi } from '../services/api';
import {
  Dna,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
  BarChart2,
  BookOpen,
} from 'lucide-react';

export const SkillDNA = () => {
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDna();
  }, []);

  const loadDna = async () => {
    setLoading(true);
    try {
      const res = await skillDnaApi.getMyDna();
      setDna(res.data);
    } catch (err) {
      console.error('Failed to load Skill DNA', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelPercent = (level) => {
    switch (level) {
      case 'EXPERT': return 100;
      case 'ADVANCED': return 80;
      case 'INTERMEDIATE': return 55;
      case 'BEGINNER': return 30;
      default: return 50;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-950/80">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Dna className="w-3.5 h-3.5" />
            <span>Algorithmic Skill Profiling</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Skill DNA & Competency Matrix
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Visual breakdown of your academic and technical competencies, verified strengths, and suggested next learning horizons.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          Calculating Skill DNA metrics from TiDB...
        </div>
      ) : !dna ? (
        <div className="p-8 rounded-3xl glass-panel text-center text-slate-400">
          Unable to generate DNA. Please ensure you have added skills in your Profile.
        </div>
      ) : (
        <>
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Skill Versatility Score
                </span>
                <div className="text-4xl font-black text-white mt-2">
                  {dna.overallSkillVersatilityScore}%
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Calculated across depth & domain diversity</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Teaching Capacity
                </span>
                <div className="text-4xl font-black text-cyan-400 mt-2">
                  {dna.teachingSkills?.length || 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Verified topics you can offer to peers</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Learning Trajectories
                </span>
                <div className="text-4xl font-black text-purple-400 mt-2">
                  {dna.learningSkills?.length || 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Active disciplines you are studying</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Target className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Two-Column Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teaching Skills Proficiency Breakdown */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Teaching Skills & Proficiency Levels</span>
              </h2>

              {dna.teachingSkills?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No teaching skills configured yet.</p>
              ) : (
                <div className="space-y-4">
                  {dna.teachingSkills.map((s) => {
                    const pct = getLevelPercent(s.level);
                    return (
                      <div key={s.id || s.skillName} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{s.skillName}</span>
                          <span className="text-slate-400 text-[11px]">
                            {s.level} · {s.category} ({s.yearsExperience} yr)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category distribution */}
              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Domain Distribution
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dna.categoryDistribution || {}).map(([cat, pct]) => (
                    <div
                      key={cat}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2"
                    >
                      <span className="text-slate-200">{cat}</span>
                      <span className="font-bold text-indigo-400">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
              {/* Identified Strengths */}
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Identified Strengths</span>
                </h3>
                <ul className="space-y-2">
                  {dna.identifiedStrengths?.map((str, idx) => (
                    <li key={idx} className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-200 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Growth Recommendations */}
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Growth Recommendations</span>
                </h3>
                <ul className="space-y-2">
                  {dna.growthRecommendations?.map((rec, idx) => (
                    <li key={idx} className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-200 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Skills to Learn Next */}
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Suggested Next Skills to Learn</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dna.suggestedSkillsToLearnNext?.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold"
                    >
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
