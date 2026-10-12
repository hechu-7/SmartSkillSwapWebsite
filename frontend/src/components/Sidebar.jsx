import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  MessageSquare,
  Calendar,
  Clock,
  Dna,
  Award,
  Coins,
  CreditCard,
  User,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Sessions', path: '/sessions', icon: Calendar },
    { name: 'Availability', path: '/availability', icon: Clock },
    { name: 'Skill DNA', path: '/skill-dna', icon: Dna },
    { name: 'Skill Passport', path: '/skill-passport', icon: Award },
    { name: 'SwapPoints', path: '/points', icon: Coins },
    { name: 'Subscription', path: '/subscription', icon: CreditCard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (user && user.role === 'ROLE_ADMIN') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 rounded-2xl glass-panel p-4 border border-slate-800/80">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Platform Menu
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Database Status footer card */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              TiDB Cloud Connected
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              MySQL protocol on port 4000. TLS VERIFY_IDENTITY active.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
