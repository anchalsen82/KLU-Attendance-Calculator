import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Code2,
  ExternalLink,
  GraduationCap,
  Heart,
  Laptop,
  School,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import React from 'react';
import { NavigationTab } from '../types/attendance';

interface AboutRecognitionViewProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const AboutRecognitionView: React.FC<AboutRecognitionViewProps> = ({
  setActiveTab,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white glass-card rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Attendance Calculator</span>
        </button>
      </div>

      {/* Main Grateful Recognition Card - Exact Visual Replica of image.png */}
      <div className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6">
          {/* Header with Trophy Icon */}
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl select-none" role="img" aria-label="Trophy">
              🏆
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Grateful Recognition
            </h1>
          </div>

          {/* Recognition Paragraph */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            I extend my heartfelt thanks to <strong className="text-slate-900 dark:text-white font-bold">Kalasalingam University, Tamil Nadu</strong> and the <strong className="text-slate-900 dark:text-white font-bold">CSE Department</strong> for acknowledging my initiative. Your recognition motivates me to continue building solutions that simplify student lives.
          </p>

          {/* Three Feature Cards matching user image */}
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3.5 sm:gap-4">
            {/* Card 1: Computer Science & Engineering */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-xl shrink-0" role="img" aria-label="Graduation Cap">
                🎓
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                Computer Science & Engineering
              </span>
            </div>

            {/* Card 2: Kalasalingam University, Tamil Nadu */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-xl shrink-0" role="img" aria-label="Classical Building">
                🏛️
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                Kalasalingam University, Tamil Nadu
              </span>
            </div>

            {/* Card 3: Student ID: 98250040004 */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-xl shrink-0" role="img" aria-label="Laptop">
                💻
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 font-mono">
                Student ID: 98250040004
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Profile & Project Story */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-indigo-500/20">
              AS
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Creator</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Anchal Singh
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lead Student Developer & Creator
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Student ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  98250040004
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  CSE
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">University:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Kalasalingam University, Tamil Nadu
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('absent')}
              className="w-full py-2.5 px-3 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 rounded-xl shadow-xs transition-opacity cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Simulate Absences & Bunks</span>
            </button>
          </div>
        </div>

        {/* Initiative Mission & Key Highlights */}
        <div className="md:col-span-2 glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>About the Platform</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Student Attendance Intelligence & Academic Hub
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Designed and built independently by <strong>Anchal Singh</strong> (ID: <code>98250040004</code>) to eliminate the stress of calculating attendance shortages, condonation risks, and examination eligibility.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="text-base">⚡</span>
                <span>Simple Attendance Calculation</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Input conducted and attended sessions to instantly evaluate exam eligibility against university cutoffs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="text-base">🎯</span>
                <span>Safe Bunk & Absence Planner</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Accurately simulates safe leaves and gives the exact number of consecutive classes needed for recovery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="text-base">📅</span>
                <span>Academic Calendars</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Access official university working days, mid-term dates, and exam schedules with in-browser PDF viewers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="text-base">📢</span>
                <span>Notices & Circulars</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Stay updated with verified college circulars, timetable updates, and official event announcements.
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <span>View Academic Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
            >
              <span>Chat with AI Advisor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
