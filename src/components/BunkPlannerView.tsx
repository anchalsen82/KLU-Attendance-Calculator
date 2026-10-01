import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Info,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { SemesterMetric, Subject } from '../types/attendance';
import { simulateAttendanceForecast } from '../utils/calculations';
import { TargetSelector } from './TargetSelector';

interface BunkPlannerViewProps {
  subjects: Subject[];
  metric: SemesterMetric;
  targetPercentage: number;
  onUpdateTarget: (target: number) => void;
  initialSubjectId?: string;
}

export const BunkPlannerView: React.FC<BunkPlannerViewProps> = ({
  subjects,
  metric,
  targetPercentage,
  onUpdateTarget,
  initialSubjectId,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || 'overall'
  );
  const [remainingClasses, setRemainingClasses] = useState<number>(20);
  const [plannedBunks, setPlannedBunks] = useState<number>(3);

  // Find active subject data or overall semester totals
  const activeData = useMemo(() => {
    if (selectedSubjectId === 'overall') {
      return {
        id: 'overall',
        name: 'Entire Semester (All Courses Combined)',
        code: 'ALL',
        attended: metric.totalAttended,
        conducted: metric.totalConducted,
        currentPercentage: metric.overallPercentage,
        target: targetPercentage,
      };
    }

    const sm = metric.subjectMetrics.find((m) => m.subject.id === selectedSubjectId);
    if (!sm) {
      return {
        id: 'overall',
        name: 'Entire Semester (All Courses Combined)',
        code: 'ALL',
        attended: metric.totalAttended,
        conducted: metric.totalConducted,
        currentPercentage: metric.overallPercentage,
        target: targetPercentage,
      };
    }

    return {
      id: sm.subject.id,
      name: sm.subject.name,
      code: sm.subject.code,
      attended: sm.attendedTotal,
      conducted: sm.conductedTotal,
      currentPercentage: sm.percentage,
      target: sm.targetPercentage,
    };
  }, [selectedSubjectId, metric, targetPercentage]);

  // Run simulation calculation
  const forecast = useMemo(() => {
    return simulateAttendanceForecast(
      activeData.attended,
      activeData.conducted,
      remainingClasses,
      plannedBunks,
      activeData.target
    );
  }, [activeData, remainingClasses, plannedBunks]);

  // Quick preset actions
  const applyPreset = (presetRemaining: number, presetBunks: number) => {
    setRemainingClasses(presetRemaining);
    setPlannedBunks(presetBunks);
  };

  const applyMaxSafeBunks = () => {
    setPlannedBunks(forecast.maxAllowableBunksFromRemaining);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Smart Bunk & Absence Forecast Planner</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Interactive Engine
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Simulate absences, predict attendance drop, and calculate safe bunks before examination cutoffs
          </p>
        </div>

        <TargetSelector currentTarget={targetPercentage} onSelectTarget={onUpdateTarget} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-7 space-y-5 shadow-sm">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Select Course to Simulate
              </label>
              <div className="relative">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-cyan-500 pr-10 cursor-pointer shadow-2xs"
                >
                  <option value="overall">Entire Semester (All Courses Combined)</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Current Course Baseline Card */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Current Standing:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {activeData.attended} attended / {activeData.conducted} conducted
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400">Current %:</span>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                  {activeData.conducted > 0 ? `${activeData.currentPercentage.toFixed(1)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Input 1: Remaining Classes in Semester */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Estimated Remaining Classes
                </label>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={remainingClasses}
                    onChange={(e) => setRemainingClasses(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1 text-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-xs text-slate-400 font-normal">classes</span>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="80"
                value={remainingClasses}
                onChange={(e) => setRemainingClasses(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>1 class</span>
                <span>40 classes</span>
                <span>80+ classes</span>
              </div>
            </div>

            {/* Input 2: Planned Bunks / Absences */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Planned Bunks / Absences
                </label>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                  <input
                    type="number"
                    min="0"
                    max={remainingClasses}
                    value={plannedBunks}
                    onChange={(e) =>
                      setPlannedBunks(
                        Math.max(0, Math.min(remainingClasses, Number(e.target.value)))
                      )
                    }
                    className="w-16 px-2 py-1 text-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-mono"
                  />
                  <span className="text-xs text-slate-400 font-normal">classes</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={remainingClasses}
                value={plannedBunks}
                onChange={(e) => setPlannedBunks(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0 bunks (100% attendance)</span>
                <span>All {remainingClasses} remaining</span>
              </div>
            </div>

            {/* Quick Scenario Preset Buttons */}
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Quick Scenario Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(remainingClasses, 1)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer"
                >
                  ⚡ Next Class (1)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(remainingClasses, 4)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer"
                >
                  🌴 Long Weekend (4)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(remainingClasses, 8)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer"
                >
                  🎪 Fest / Event (8)
                </button>
                <button
                  type="button"
                  onClick={applyMaxSafeBunks}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors text-left cursor-pointer"
                >
                  🎯 Max Safe Bunks ({forecast.maxAllowableBunksFromRemaining})
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(remainingClasses, 0)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer"
                >
                  ✨ Zero Absences (0)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(20, 3)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projected Outcome & Plain-Language Analysis */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Projected Forecast Result
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  forecast.isTargetMet
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                }`}
              >
                {forecast.isTargetMet ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Target Met ({targetPercentage}%)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Target Missed</span>
                  </>
                )}
              </span>
            </div>

            {/* Projection Comparison Hero */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50/80 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              {/* Current */}
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Current Standing</span>
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 mt-1">
                  {activeData.conducted > 0 ? activeData.currentPercentage.toFixed(1) : '0'}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {activeData.attended} of {activeData.conducted} classes
                </div>
              </div>

              {/* Forecast */}
              <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">Projected Ending</span>
                <div
                  className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-1 ${
                    forecast.isTargetMet
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {forecast.projectedPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                  {forecast.percentageChange >= 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      +{forecast.percentageChange}%
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                      {forecast.percentageChange}%
                    </span>
                  )}
                  <span>({forecast.projectedAttended}/{forecast.projectedConducted})</span>
                </div>
              </div>
            </div>

            {/* Verdict Explanation Box */}
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                forecast.isTargetMet
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200'
              }`}
            >
              <p className="font-semibold flex items-center gap-2 mb-1">
                {forecast.isTargetMet ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                )}
                <span>
                  {forecast.isTargetMet ? 'Safe Scenario' : 'Deficit Risk Detected'}
                </span>
              </p>
              <p>
                {forecast.isTargetMet ? (
                  <>
                    Taking <strong>{plannedBunks}</strong> planned bunks out of{' '}
                    <strong>{remainingClasses}</strong> remaining classes leaves your attendance at{' '}
                    <strong className="font-mono">{forecast.projectedPercentage}%</strong>, keeping you
                    safely above your <strong>{activeData.target}%</strong> target.
                  </>
                ) : (
                  <>
                    Taking <strong>{plannedBunks}</strong> bunks will pull your attendance down to{' '}
                    <strong className="font-mono">{forecast.projectedPercentage}%</strong>, below the{' '}
                    <strong>{activeData.target}%</strong> mandatory limit. You can safely bunk at most{' '}
                    <strong>{forecast.maxAllowableBunksFromRemaining}</strong> classes.
                  </>
                )}
              </p>
            </div>

            {/* Key Planning Indicators */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400">Maximum Safe Bunk Limit</span>
                <div className="text-xl font-bold font-mono tabular-nums text-cyan-600 dark:text-cyan-400 mt-1">
                  {forecast.maxAllowableBunksFromRemaining}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    of {remainingClasses}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Maximum absences allowed to maintain {activeData.target}%
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400">Classes to Attend</span>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                  {remainingClasses - plannedBunks}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    of {remainingClasses}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Minimum attendance needed in this plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
