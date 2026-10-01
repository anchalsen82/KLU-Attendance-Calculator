import {
  Bot,
  ExternalLink,
  GraduationCap,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';
import React from 'react';
import { NavigationTab } from '../types/attendance';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
}) => {
  const navTabs: { id: NavigationTab; label: string; isAi?: boolean }[] = [
    { id: 'home', label: 'HOME' },
    { id: 'absent', label: 'WHEN ABSENT' },
    { id: 'calendar', label: 'CALENDAR' },
    { id: 'notifications', label: 'CIRCULARS' },
    { id: 'ai', label: 'AI ADVISOR', isAi: true },
    { id: 'about', label: 'ABOUT' },
    { id: 'admin', label: 'ADMIN' },
    { id: 'settings', label: 'SETTINGS' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 dark:bg-[#070b19]/90 text-white backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-2">
          {/* Brand & Futuristic Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-hidden group"
              title="Kalasalingam University Attendance Portal"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all">
                <div className="w-full h-full rounded-[10px] bg-[#0a0f1d] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold tracking-tight text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                    KLU
                  </span>
                  <span className="font-bold text-white/90 text-sm sm:text-base">
                    Attendance
                  </span>
                </div>
                <span className="hidden xl:inline text-[10px] font-medium text-slate-400 tracking-wider">
                  Kalasalingam University, Tamil Nadu
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 h-full overflow-x-auto no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-full px-3 xl:px-3.5 py-2 text-xs font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 relative ${
                    isActive
                      ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/10 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border-b-2 border-transparent'
                  }`}
                >
                  {tab.isAi && <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                  <span>{tab.label}</span>
                  {tab.id === 'notifications' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: AI Quick button, SIS Portal link, Theme toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* AI Assistant Quick Pill */}
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shadow-xs"
              title="Open AI Attendance Advisor"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Kalasalingam SIS Link */}
            <a
              href="https://sis.kalasalingam.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Open Kalasalingam University SIS Portal"
            >
              <span>SIS Login</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              title="Toggle Light / Dark mode"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-300" />
              )}
            </button>
          </div>
        </div>

        {/* Secondary horizontal scrolling tab strip for mobile/tablet screens */}
        <div className="lg:hidden flex items-center overflow-x-auto py-1.5 gap-1.5 border-t border-slate-800 -mx-3 px-3 no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 text-[11px] font-bold tracking-wider rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.isAi && <Sparkles className="w-3 h-3 text-indigo-400" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
