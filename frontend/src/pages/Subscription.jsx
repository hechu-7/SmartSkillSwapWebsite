import React, { useState } from 'react';
import { CreditCard, Check, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Subscription = () => {
  const { user } = useAuth();
  const [sandboxNotice, setSandboxNotice] = useState(false);

  const handleSimulateUpgrade = () => {
    setSandboxNotice(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Membership & Scholar Tiers</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Unlock unlimited peer bookings, priority algorithm discovery matching, and certified Skill Passport verification badges.
          </p>
        </div>
      </div>

      {sandboxNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div>
            <h4 className="font-bold text-sm text-white">Sandbox Mode Notice</h4>
            <p className="mt-0.5 text-slate-300 leading-relaxed">
              Real payment processing is currently in sandbox development mode. No real credit card charges are processed, and no payment gateways are enabled yet in this deployment.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Student Free</h3>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                Current Plan
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>
            <p className="text-xs text-slate-400">
              Ideal for exploring skill exchanges and participating in peer mentoring.
            </p>

            <ul className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>100 Welcome SwapPoints</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited 1-on-1 STOMP real-time chat</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Public Availability Slot publishing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Basic Skill DNA profiling</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
          >
            Active Plan
          </button>
        </div>

        {/* Pro Scholar Plan */}
        <div className="glass-card rounded-3xl p-8 border border-indigo-500/40 relative overflow-hidden space-y-6 flex flex-col justify-between glow-brand">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-xl">
            Scholar Pro
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Pro Scholar</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$4.99</span>
              <span className="text-xs text-slate-400">/ semester</span>
            </div>
            <p className="text-xs text-slate-400">
              Accelerate your peer credentials with priority discovery and certified verification.
            </p>

            <ul className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-200">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>500 Monthly SwapPoints Credit</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Priority placement on Discover page</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Verified TiDB Skill Passport Credential Badge</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Advanced Skill DNA radar & growth roadmap</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleSimulateUpgrade}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Pro Scholar (Sandbox)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
