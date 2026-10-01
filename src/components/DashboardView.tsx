import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  FlaskConical,
  GraduationCap,
  Layers,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import React from 'react';
import {
  COMPONENT_CONFIGS,
  ComponentType,
  SemesterMetric,
  Subject,
} from '../types/attendance';
import { COMPONENT_KEYS } from '../utils/calculations';
import { DisclaimerBanner } from './DisclaimerBanner';
import { TargetSelector } from './TargetSelector';

interface DashboardViewProps {
  metric: SemesterMetric;
  subjects: Subject[];
  targetPercentage: number;
  onUpdateTarget: (target: number) => void;
  onNavigateToTab: (tab: 'dashboard' | 'calculator' | 'planner' | 'settings') => void;
  onOpenAddSubject: () => void;
  onSelectSubjectForPlanner?: (subjectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metric,
  subjects,
  targetPercentage,
  onUpdateTarget,
  onNavigateToTab,
  onOpenAddSubject,
  onSelectSubjectForPlanner,
}) => {
  const {
    overallPercentage,
    status,
    differenceFromTarget,
    totalConducted,
    totalAttended,
    safeCount,
    warningCount,
    criticalCount,
    overallSafeBunks,
    overallRecoveryNeeded,
    subjectMetrics,
  } = metric;

  // Component icon mapping
  const componentIcons: Record<ComponentType, React.ElementType> = {
    lecture: BookOpen,
    practical: FlaskConical,
    tutorial: Clock,
    skill: Sparkles,
    tcbr: Layers,
  };

  // Status visual styles
  const getStatusBadge = (st: typeof status) => {
    switch (st) {
      case 'safe':
        return {
          label: 'Safe Attendance',
          bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-500/30',
          icon: CheckCircle2,
        };
      case 'warning':
        return {
          label: 'Borderline Warning',
          bg: 'bg-amber-500/15 dark:bg-amber-500/20',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-500/30',
          icon: AlertTriangle,
        };
      case 'critical':
        return {
          label: 'Attendance Shortage',
          bg: 'bg-rose-500/15 dark:bg-rose-500/20',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-500/30',
          icon: XCircle,
        };
      default:
        return {
          label: 'No Data Yet',
          bg: 'bg-stone-500/15',
          text: 'text-stone-600 dark:text-stone-400',
          border: 'border-stone-500/20',
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusBadge(status);
  const StatusIcon = statusInfo.icon;

  // Calculate component totals across all subjects
  const componentTotals = COMPONENT_KEYS.map((key) => {
    let conducted = 0;
    let attended = 0;

    subjects.forEach((sub) => {
      const comp = sub.components[key];
      if (comp && comp.enabled) {
        conducted += comp.conducted || 0;
        attended += Math.min(comp.conducted || 0, comp.attended || 0);
      }
    });

    const percentage = conducted > 0 ? Number(((attended / conducted) * 100).toFixed(1)) : 0;
    return {
      key,
      label: COMPONENT_CONFIGS[key].label,
      shortLabel: COMPONENT_CONFIGS[key].shortLabel,
      conducted,
      attended,
      percentage,
      icon: componentIcons[key],
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Target Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Academic Attendance Overview
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            <span>{subjects.length} Enrolled Courses</span>
            <span aria-hidden="true">·</span>
            <span>{totalConducted} Total Classes Recorded</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{totalAttended} Attended</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TargetSelector
            currentTarget={targetPercentage}
            onSelectTarget={onUpdateTarget}
          />
        </div>
      </div>

      {/* Main Metric Spotlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Attendance Hero Gauge */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                Overall Semester Attendance
              </span>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-5xl sm:text-6xl font-bold font-mono tabular-nums text-stone-900 dark:text-white tracking-tight">
                  {overallPercentage.toFixed(1)}
                  <span className="text-3xl sm:text-4xl text-stone-400 dark:text-stone-500 font-normal">%</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{statusInfo.label}</span>
                </span>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-xs text-stone-500 dark:text-stone-400">Target Goal</span>
              <div className="text-xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                {targetPercentage}%
              </div>
              <div className="flex items-center justify-end gap-1 text-xs mt-0.5">
                {differenceFromTarget >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +{differenceFromTarget.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-mono tabular-nums flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                    {differenceFromTarget.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar with Target Marker */}
          <div className="mt-8 space-y-2">
            <div className="relative h-4 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === 'safe'
                    ? 'bg-emerald-500'
                    : status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, overallPercentage))}%` }}
              />
              {/* Target Threshold Guide Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-stone-900 dark:bg-white z-10 shadow-xs"
                style={{ left: `${Math.min(100, Math.max(0, targetPercentage))}%` }}
                title={`Target: ${targetPercentage}%`}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-stone-500 dark:text-stone-400 font-mono">
              <span>0%</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Threshold: {targetPercentage}%
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Dynamic Insight Banner */}
          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {status === 'safe' ? (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  You have <strong className="font-mono tabular-nums">{overallSafeBunks}</strong> aggregate safe bunks available before dipping below {targetPercentage}%.
                </span>
              </div>
            ) : status === 'warning' ? (
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Borderline zone. Attend next <strong className="font-mono tabular-nums">{overallRecoveryNeeded}</strong> consecutive classes to reach safe status.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-medium">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>
                  Attendance shortage! Must attend <strong className="font-mono tabular-nums">{overallRecoveryNeeded}</strong> continuous classes without any absences.
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigateToTab('planner')}
              className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Simulate Absences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Quick Stats Quad */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {/* Card 1: Safe Courses */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">
                Safe Courses
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-white">
                {safeCount}
                <span className="text-sm font-normal text-stone-400 ml-1">/ {subjects.length}</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                At or above {targetPercentage}%
              </p>
            </div>
          </div>

          {/* Card 2: Deficit / Warning Courses */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">
                At Risk
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-white">
                {warningCount + criticalCount}
                <span className="text-sm font-normal text-stone-400 ml-1">courses</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {criticalCount} critical, {warningCount} warning
              </p>
            </div>
          </div>

          {/* Card 3: Safe Bunk Pool */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">
                Safe Bunk Pool
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-white">
                {overallSafeBunks}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Total aggregate margin
              </p>
            </div>
          </div>

          {/* Card 4: Classes To Recover */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">
                Recovery Needed
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-white">
                {overallRecoveryNeeded}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Classes to reach {targetPercentage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Breakdown Strip */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
            Component Attendance Breakdown
          </h2>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Lecture, Practical, Tutorial, Skill & TCBR
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {componentTotals.map((comp) => {
            const CompIcon = comp.icon;
            const hasData = comp.conducted > 0;
            const isSafe = comp.percentage >= targetPercentage;

            return (
              <div
                key={comp.key}
                className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3.5 border border-stone-200/60 dark:border-stone-800"
              >
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <CompIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>{comp.label}</span>
                  </span>
                  <span className="font-mono text-[11px]">{comp.shortLabel}</span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      !hasData
                        ? 'text-stone-400'
                        : isSafe
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {hasData ? `${comp.percentage}%` : '—'}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-stone-400">
                    {comp.attended}/{comp.conducted}
                  </span>
                </div>

                <div className="mt-2 h-1.5 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      !hasData
                        ? 'bg-transparent'
                        : isSafe
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, comp.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Health Roster */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white tracking-tight">
              Course Attendance Roster
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Live status, safe bunks, and recovery targets per subject
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToTab('calculator')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Calculator</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
            <GraduationCap className="w-10 h-10 mx-auto text-stone-400 mb-2" />
            <h3 className="text-sm font-semibold text-stone-900 dark:text-white">No courses enrolled</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Add your first subject or load sample KLU data to start tracking attendance.
            </p>
            <button
              type="button"
              onClick={onOpenAddSubject}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              + Add First Course
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {subjectMetrics.map((sm) => {
              const sub = sm.subject;
              const isSafe = sm.status === 'safe';
              const isWarning = sm.status === 'warning';

              return (
                <div
                  key={sub.id}
                  className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 dark:hover:bg-stone-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                        sm.status === 'safe'
                          ? 'bg-emerald-500'
                          : sm.status === 'warning'
                          ? 'bg-amber-500'
                          : sm.status === 'critical'
                          ? 'bg-rose-500'
                          : 'bg-stone-300'
                      }`}
                      title={sm.status}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {sub.code && (
                          <span className="font-mono text-xs font-semibold text-stone-500 dark:text-stone-400">
                            {sub.code}
                          </span>
                        )}
                        <h4 className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                          {sub.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        <span className="font-mono tabular-nums">
                          {sm.attendedTotal} / {sm.conductedTotal} attended
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Target: {sm.targetPercentage}%</span>
                        {sub.credits && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{sub.credits} Credits</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    {/* Bunk / Recovery Callout */}
                    <div className="text-left sm:text-right">
                      {sm.hasClasses ? (
                        isSafe ? (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="font-mono font-bold tabular-nums">{sm.safeBunks}</span> safe bunk{sm.safeBunks === 1 ? '' : 's'}
                          </div>
                        ) : (
                          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                            Attend next <span className="font-mono font-bold tabular-nums">{sm.recoveryNeeded}</span>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-stone-400">No classes conducted</span>
                      )}
                    </div>

                    {/* Percentage Display */}
                    <div className="text-right min-w-[70px]">
                      <div
                        className={`text-lg font-bold font-mono tabular-nums ${
                          !sm.hasClasses
                            ? 'text-stone-400'
                            : isSafe
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {sm.hasClasses ? `${sm.percentage.toFixed(1)}%` : '—'}
                      </div>
                    </div>

                    {/* Action link */}
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('calculator')}
                      className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                      title="Open in Calculator"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Academic ERP Disclaimer Notice */}
      <DisclaimerBanner />
    </div>
  );
};
