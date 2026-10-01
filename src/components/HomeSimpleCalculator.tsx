import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  GraduationCap,
  Layers,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { NavigationTab, SemesterMetric, Subject } from '../types/attendance';
import { calculateBunksAndRecovery, determineStatus } from '../utils/calculations';
import { DisclaimerBanner } from './DisclaimerBanner';
import { InteractiveCharts } from './InteractiveCharts';
import { ProgressRing } from './ProgressRing';
import { TargetSelector } from './TargetSelector';

interface HomeSimpleCalculatorProps {
  metric: SemesterMetric;
  subjects: Subject[];
  targetPercentage: number;
  onUpdateTarget: (target: number) => void;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenAddSubject: () => void;
}

export const HomeSimpleCalculator: React.FC<HomeSimpleCalculatorProps> = ({
  metric,
  subjects,
  targetPercentage,
  onUpdateTarget,
  setActiveTab,
  onOpenAddSubject,
}) => {
  // Simple calculator local state
  const [totalClassesInput, setTotalClassesInput] = useState<string>('50');
  const [attendedClassesInput, setAttendedClassesInput] = useState<string>('42');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'safe' | 'warning' | 'critical'>('all');

  const [calculatedResult, setCalculatedResult] = useState<{
    conducted: number;
    attended: number;
    percentage: number;
    safeBunks: number;
    recoveryNeeded: number;
    status: 'safe' | 'warning' | 'critical' | 'unrecorded';
  } | null>(() => {
    const { safeBunks, recoveryNeeded, percentage } = calculateBunksAndRecovery(42, 50, targetPercentage);
    const status = determineStatus(percentage, targetPercentage, 50);
    return {
      conducted: 50,
      attended: 42,
      percentage: Number(percentage.toFixed(2)),
      safeBunks,
      recoveryNeeded,
      status,
    };
  });

  const [inputError, setInputError] = useState<string | null>(null);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);

    const conducted = parseInt(totalClassesInput, 10);
    const attended = parseInt(attendedClassesInput, 10);

    if (isNaN(conducted) || conducted < 0) {
      setInputError('Please enter a valid positive number for total classes.');
      return;
    }

    if (isNaN(attended) || attended < 0) {
      setInputError('Please enter a valid positive number for classes attended.');
      return;
    }

    if (attended > conducted) {
      setInputError('Classes attended cannot exceed the total number of conducted classes.');
      return;
    }

    const { safeBunks, recoveryNeeded, percentage } = calculateBunksAndRecovery(
      attended,
      conducted,
      targetPercentage
    );
    const status = determineStatus(percentage, targetPercentage, conducted);

    setCalculatedResult({
      conducted,
      attended,
      percentage: Number(percentage.toFixed(2)),
      safeBunks,
      recoveryNeeded,
      status,
    });
  };

  const handleReset = () => {
    setTotalClassesInput('');
    setAttendedClassesInput('');
    setInputError(null);
    setCalculatedResult(null);
  };

  // Re-calculate when target percentage changes
  React.useEffect(() => {
    if (calculatedResult) {
      const { safeBunks, recoveryNeeded, percentage } = calculateBunksAndRecovery(
        calculatedResult.attended,
        calculatedResult.conducted,
        targetPercentage
      );
      const status = determineStatus(percentage, targetPercentage, calculatedResult.conducted);
      setCalculatedResult({
        ...calculatedResult,
        safeBunks,
        recoveryNeeded,
        status,
      });
    }
  }, [targetPercentage]);

  // Filtered subject list
  const filteredSubjectMetrics = metric.subjectMetrics.filter((m) => {
    if (subjectFilter === 'all') return true;
    return m.status === subjectFilter;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* 1. Target Selector Top Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200/90 dark:border-slate-800/90">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Examination Target Criterion</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              KARE Standard
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set your target percentage to calculate allowable bunks and recovery targets
          </p>
        </div>
        <TargetSelector currentTarget={targetPercentage} onSelectTarget={onUpdateTarget} />
      </div>

      {/* 2. Hero 3D HUD: Semester Health Overview */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Big Animated Progress Ring */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-2 text-center">
            <ProgressRing
              percentage={metric.overallPercentage}
              target={targetPercentage}
              size={180}
              strokeWidth={14}
              label="Cumulative"
              status={metric.status}
            />
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  metric.status === 'safe'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : metric.status === 'warning'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}
              >
                {metric.status === 'safe'
                  ? 'Safe Exam Zone'
                  : metric.status === 'warning'
                  ? 'Borderline Warning'
                  : 'Critical Shortage'}
              </span>
            </div>
          </div>

          {/* Right: Key Stats Deck */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Classes Ratio */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Attendance Ratio</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {metric.totalAttended} / {metric.totalConducted} classes
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {metric.overallPercentage.toFixed(1)}%
                </span>
                <span className="text-xs font-medium text-slate-400">cumulative</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(metric.overallPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Safe Bunks Available */}
            <div className="p-4 sm:p-5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/20 space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Safe Bunk Buffer</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                  {targetPercentage}% Target
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400">
                  {metric.overallSafeBunks}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                  classes can be missed safely
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {metric.overallSafeBunks > 0
                  ? `You will remain at or above ${targetPercentage}% after missing these classes.`
                  : 'Zero safe leaves available. Every absence drops your eligibility.'}
              </p>
            </div>

            {/* Recovery Needed */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Classes to Attend</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                  Recovery
                </span>
              </div>
              <div>
                <span
                  className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                    metric.overallRecoveryNeeded > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {metric.overallRecoveryNeeded}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                  {metric.overallRecoveryNeeded > 0 ? 'consecutive classes required' : 'classes needed'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {metric.overallRecoveryNeeded > 0
                  ? `Attend next ${metric.overallRecoveryNeeded} classes without missing any to hit ${targetPercentage}%.`
                  : `You are safely above the ${targetPercentage}% threshold.`}
              </p>
            </div>

            {/* Quick Action Dock */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-cyan-500/10 border border-indigo-500/20 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Academic Assistant</span>
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Ask questions about leave policies, exam condonation, and forecast scenarios.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 rounded-xl shadow-xs transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Consult AI Advisor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Quick Attendance Calculator Card */}
      <div className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Quick Attendance & Bunk Calculator</span>
              <span className="text-xs font-mono font-normal text-cyan-500">Live Forecast</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter or slide conducted and attended sessions to compute percentage and safe leaves
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer self-start sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Validation Alert */}
        {inputError && (
          <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{inputError}</span>
          </div>
        )}

        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Box 1: Total Conducted Classes */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Total Conducted Classes
                </label>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {totalClassesInput || 0} classes
                </span>
              </div>
              <input
                type="number"
                min="0"
                value={totalClassesInput}
                onChange={(e) => setTotalClassesInput(e.target.value)}
                placeholder="Enter conducted classes"
                className="w-full px-4 py-2.5 text-sm sm:text-base font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-cyan-500 placeholder-slate-400 shadow-2xs font-mono"
              />
              <input
                type="range"
                min={0}
                max={120}
                value={Number(totalClassesInput) || 0}
                onChange={(e) => setTotalClassesInput(e.target.value)}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Box 2: Classes Attended */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Classes Attended
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {attendedClassesInput || 0} classes
                </span>
              </div>
              <input
                type="number"
                min="0"
                value={attendedClassesInput}
                onChange={(e) => setAttendedClassesInput(e.target.value)}
                placeholder="Enter attended classes"
                className="w-full px-4 py-2.5 text-sm sm:text-base font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-cyan-500 placeholder-slate-400 shadow-2xs font-mono"
              />
              <input
                type="range"
                min={0}
                max={Number(totalClassesInput) || 120}
                value={Number(attendedClassesInput) || 0}
                onChange={(e) => setAttendedClassesInput(e.target.value)}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 rounded-xl shadow-xs transition-opacity cursor-pointer flex items-center gap-2"
            >
              <span>Calculate Result</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Calculation Result Callout */}
        {calculatedResult && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Calculated Percentage</span>
                <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {calculatedResult.percentage}%
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {calculatedResult.attended}/{calculatedResult.conducted} sessions
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">Safe Bunks</span>
                <div className="text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                  {calculatedResult.safeBunks} classes
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  You can safely miss without dropping below {targetPercentage}%
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Recovery Classes</span>
                <div
                  className={`text-3xl font-extrabold font-mono mt-0.5 ${
                    calculatedResult.recoveryNeeded > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {calculatedResult.recoveryNeeded} classes
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {calculatedResult.recoveryNeeded > 0
                    ? `Attend next ${calculatedResult.recoveryNeeded} consecutive classes to hit target.`
                    : 'Safely above criteria.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Interactive Visual Charts Section */}
      <InteractiveCharts metric={metric} subjects={subjects} targetPercentage={targetPercentage} />

      {/* 5. Subject-Wise Analytics Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-500" />
              <span>Subject-Wise Analytics ({subjects.length} Courses)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Component-level attendance tracking and individual safe bunk planning
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSubjectFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  subjectFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('safe')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  subjectFilter === 'safe'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Safe
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('warning')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  subjectFilter === 'warning'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Warning
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('critical')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  subjectFilter === 'critical'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Critical
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenAddSubject}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-xs transition-opacity hover:opacity-90 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* Subjects Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjectMetrics.length === 0 ? (
            <div className="col-span-2 py-10 text-center glass-card rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No subjects matching this filter.
            </div>
          ) : (
            filteredSubjectMetrics.map((sm) => {
              const isSafe = sm.percentage >= targetPercentage;
              return (
                <div
                  key={sm.subject.id}
                  className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 space-y-4 hover:border-cyan-500/40 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {sm.subject.code && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {sm.subject.code}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {sm.subject.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">
                        {sm.attendedTotal} of {sm.conductedTotal} classes attended
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                        {sm.percentage.toFixed(1)}%
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${
                          sm.status === 'safe'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : sm.status === 'warning'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {sm.status === 'safe' ? `${sm.safeBunks} Safe Bunks` : `Need ${sm.recoveryNeeded} Classes`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sm.status === 'safe'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                          : sm.status === 'warning'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}
                      style={{ width: `${Math.min(sm.percentage, 100)}%` }}
                    />
                  </div>

                  {/* Components Tag Breakdown */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    {Object.entries(sm.components).map(([compKey, comp]) => {
                      if (comp.conducted === 0) return null;
                      return (
                        <span
                          key={compKey}
                          className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80"
                        >
                          {comp.shortLabel}: {comp.attended}/{comp.conducted} ({comp.percentage}%)
                        </span>
                      );
                    })}
                  </div>

                  {/* Plan Absences Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Target: {sm.targetPercentage}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('absent')}
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Simulate Absences</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Grateful Recognition Banner (Honoring Anchal Singh) */}
      <div className="glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 text-lg">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Grateful Recognition — Anchal Singh
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                CSE · ID: 98250040004
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Heartfelt thanks to Kalasalingam University, Tamil Nadu and the CSE Department for acknowledging this student initiative.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-colors shrink-0 cursor-pointer self-start sm:self-center"
        >
          <span>View Recognition &rarr;</span>
        </button>
      </div>

      {/* 7. University ERP Disclaimer Banner */}
      <DisclaimerBanner />
    </div>
  );
};
