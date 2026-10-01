import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  PieChart,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { SemesterMetric, Subject } from '../types/attendance';

interface InteractiveChartsProps {
  metric: SemesterMetric;
  subjects: Subject[];
  targetPercentage: number;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  metric,
  subjects,
  targetPercentage,
}) => {
  const [activeChartView, setActiveChartView] = useState<'bars' | 'distribution' | 'impact'>('bars');
  const [simulatedBunks, setSimulatedBunks] = useState(2);

  const subjectMetrics = metric.subjectMetrics.filter((m) => m.hasClasses);

  // Compute what-if simulation for weekly absence
  const totalAttended = metric.totalAttended;
  const totalConducted = metric.totalConducted;
  const simConducted = totalConducted + simulatedBunks;
  const simAttended = totalAttended; // missed classes
  const simPercentage = simConducted > 0 ? Number(((simAttended / simConducted) * 100).toFixed(2)) : 0;
  const deltaPct = Number((simPercentage - metric.overallPercentage).toFixed(2));
  const isSimSafe = simPercentage >= targetPercentage;

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 space-y-6">
      {/* Chart Header & Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Interactive Attendance Analytics & Visuals
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visual comparison against your {targetPercentage}% university examination criteria
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveChartView('bars')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartView === 'bars'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Course Bars</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartView('distribution')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartView === 'distribution'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Health Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartView('impact')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartView === 'impact'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Bunk Impact</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: COURSE COMPARISON BARS */}
      {activeChartView === 'bars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Course Name & Code</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Current %</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-rose-500" />
                <span>Target: {targetPercentage}%</span>
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            {subjectMetrics.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active courses recorded yet. Add courses or log attendance to see comparison charts.
              </div>
            ) : (
              subjectMetrics.map((sm) => {
                const isOver = sm.percentage >= targetPercentage;
                const delta = (sm.percentage - targetPercentage).toFixed(1);
                return (
                  <div key={sm.subject.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 max-w-[65%] truncate">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {sm.subject.name}
                        </span>
                        {sm.subject.code && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            {sm.subject.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-slate-500">
                          {sm.attendedTotal}/{sm.conductedTotal}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sm.percentage.toFixed(1)}%
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isOver
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isOver ? `+${delta}%` : `${delta}%`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container with Target Reference Marker */}
                    <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      {/* Bar Fill */}
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          sm.status === 'safe'
                            ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400'
                            : sm.status === 'warning'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-rose-500 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(sm.percentage, 100)}%` }}
                      />
                      {/* Target Marker Line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                        style={{ left: `${targetPercentage}%` }}
                        title={`Target: ${targetPercentage}%`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ATTENDANCE HEALTH STATUS DISTRIBUTION */}
      {activeChartView === 'distribution' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Safe Subjects Card */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Eligible Zone</span>
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                &ge; {targetPercentage}%
              </span>
            </div>
            <div>
              <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {metric.safeCount}
              </span>
              <span className="text-xs text-slate-500 ml-1">
                / {metric.activeSubjectsCount} courses
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Courses where you have full examination eligibility and buffer bunks.
            </p>
          </div>

          {/* Warning Subjects Card */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Warning Zone</span>
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {Math.max(0, targetPercentage - 5)}%–{targetPercentage - 0.1}%
              </span>
            </div>
            <div>
              <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                {metric.warningCount}
              </span>
              <span className="text-xs text-slate-500 ml-1">
                / {metric.activeSubjectsCount} courses
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Close to detention threshold. Avoid any absence until safe buffer is restored.
            </p>
          </div>

          {/* Critical Shortage Card */}
          <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>Critical Shortage</span>
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                &lt; {Math.max(0, targetPercentage - 5)}%
              </span>
            </div>
            <div>
              <span className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                {metric.criticalCount}
              </span>
              <span className="text-xs text-slate-500 ml-1">
                / {metric.activeSubjectsCount} courses
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Immediate attendance recovery required to prevent course detention.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: WEEKLY BUNK IMPACT SIMULATOR */}
      {activeChartView === 'impact' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulate Absences This Week
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                See how missing upcoming classes directly drops your cumulative percentage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Planned Absences:</span>
              <span className="text-base font-extrabold font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
                {simulatedBunks} classes
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={simulatedBunks}
              onChange={(e) => setSimulatedBunks(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0 (No Absences)</span>
              <span>5 Classes</span>
              <span>10 Classes</span>
            </div>
          </div>

          {/* Impact Comparison Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Attendance
              </span>
              <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                {metric.overallPercentage.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Projected Attendance
              </span>
              <div
                className={`text-xl font-bold font-mono mt-0.5 ${
                  isSimSafe
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {simPercentage.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Impact Delta
              </span>
              <div className="text-xl font-bold font-mono text-rose-500 mt-0.5 flex items-center justify-center gap-1">
                <TrendingDown className="w-4 h-4" />
                <span>{deltaPct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
