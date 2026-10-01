import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Copy,
  Edit2,
  Filter,
  FlaskConical,
  GraduationCap,
  Layers,
  Minus,
  Plus,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  AttendanceStatus,
  COMPONENT_CONFIGS,
  ComponentType,
  SemesterMetric,
  Subject,
} from '../types/attendance';
import { COMPONENT_KEYS } from '../utils/calculations';
import { TargetSelector } from './TargetSelector';

interface CalculatorViewProps {
  subjects: Subject[];
  metric: SemesterMetric;
  targetPercentage: number;
  onUpdateTarget: (target: number) => void;
  onOpenAddSubject: () => void;
  onOpenEditSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onDuplicateSubject: (subject: Subject) => void;
  onStepComponent: (
    subjectId: string,
    compType: ComponentType,
    field: 'attended' | 'conducted',
    delta: number
  ) => void;
  onSetComponentValues: (
    subjectId: string,
    compType: ComponentType,
    conducted: number,
    attended: number
  ) => void;
  onToggleComponent: (
    subjectId: string,
    compType: ComponentType,
    enabled: boolean
  ) => void;
  onNavigateToPlannerWithSubject: (subjectId: string) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  subjects,
  metric,
  targetPercentage,
  onUpdateTarget,
  onOpenAddSubject,
  onOpenEditSubject,
  onDeleteSubject,
  onDuplicateSubject,
  onStepComponent,
  onSetComponentValues,
  onToggleComponent,
  onNavigateToPlannerWithSubject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'warning' | 'critical'>('all');
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedSubjectIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const componentIcons: Record<ComponentType, React.ElementType> = {
    lecture: BookOpen,
    practical: FlaskConical,
    tutorial: Sliders,
    skill: Sparkles,
    tcbr: Layers,
  };

  // Filter subjects based on query and status filter
  const filteredMetrics = metric.subjectMetrics.filter((sm) => {
    const sub = sm.subject;
    const matchesQuery =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (statusFilter === 'all') return true;
    return sm.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Title Banner */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Subject-wise Attendance Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Manage your individual semester courses, log daily attendance with +1/-1 steppers, and monitor safe bunks
          </p>
        </div>

        <TargetSelector
          currentTarget={targetPercentage}
          onSelectTarget={onUpdateTarget}
        />
      </div>

      {/* Control Bar: Search, Filters, Add Button */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by name or code (e.g., 23CS2101)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Right: Status Filters & Target Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Segmented Control */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-medium">
            {(['all', 'safe', 'warning', 'critical'] as const).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setStatusFilter(filterKey)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                  statusFilter === filterKey
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>

          <TargetSelector
            currentTarget={targetPercentage}
            onSelectTarget={onUpdateTarget}
            size="sm"
          />

          <button
            type="button"
            onClick={onOpenAddSubject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredMetrics.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center shadow-xs">
          <GraduationCap className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-900 dark:text-white">
            {subjects.length === 0 ? 'No courses added yet' : 'No courses match your filter'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            {subjects.length === 0
              ? 'Click "+ Add Course" to enter your timetable, or reset to sample KLU subjects in Settings.'
              : 'Try clearing your search query or switching the status filter.'}
          </p>
          {subjects.length === 0 && (
            <button
              type="button"
              onClick={onOpenAddSubject}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              + Add Course
            </button>
          )}
        </div>
      ) : (
        /* Subject Cards Grid */
        <div className="space-y-5">
          {filteredMetrics.map((sm) => {
            const sub = sm.subject;
            const isSafe = sm.status === 'safe';
            const isWarning = sm.status === 'warning';
            const isCritical = sm.status === 'critical';

            const statusColor = isSafe
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : isWarning
              ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
              : isCritical
              ? 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
              : 'text-stone-600 dark:text-stone-400 bg-stone-500/10 border-stone-500/20';

            return (
              <div
                key={sub.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Subject Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {sub.code && (
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {sub.code}
                        </span>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                        {sub.name}
                      </h3>
                      {sub.credits && (
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          ({sub.credits} Credits)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span>Conducted: <strong className="font-mono tabular-nums text-stone-700 dark:text-stone-300">{sm.conductedTotal}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Attended: <strong className="font-mono tabular-nums text-stone-700 dark:text-stone-300">{sm.attendedTotal}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Target: <strong className="font-mono tabular-nums text-stone-700 dark:text-stone-300">{sm.targetPercentage}%</strong></span>
                    </div>
                  </div>

                  {/* Percentage & Status Callout */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline gap-1.5 sm:justify-end">
                        <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-white">
                          {sm.hasClasses ? `${sm.percentage.toFixed(1)}%` : '—'}
                        </span>
                      </div>

                      <div className="mt-0.5">
                        {sm.hasClasses ? (
                          isSafe ? (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {sm.safeBunks} safe bunk{sm.safeBunks === 1 ? '' : 's'}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                              Attend {sm.recoveryNeeded} to recover
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-stone-400">0 Classes</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 border-l border-stone-200 dark:border-stone-800 pl-3">
                      <button
                        type="button"
                        onClick={() => onNavigateToPlannerWithSubject(sub.id)}
                        title="Simulate bunks in Bunk Planner"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <CalendarDays className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditSubject(sub)}
                        title="Edit course details"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicateSubject(sub)}
                        title="Duplicate course"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSubject(sub.id)}
                        title="Delete course"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Component Breakdown Cards (Lecture, Practical, Tutorial, Skill, TCBR) */}
                <div className="p-4 sm:p-5 bg-stone-50/50 dark:bg-stone-950/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {COMPONENT_KEYS.map((key) => {
                      const compData = sub.components[key];
                      const compMetric = sm.components[key];
                      const isEnabled = compData?.enabled ?? true;
                      const Icon = componentIcons[key];

                      return (
                        <div
                          key={key}
                          className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                            !isEnabled
                              ? 'opacity-40 bg-stone-100/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800'
                              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xs'
                          }`}
                        >
                          {/* Header row */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 text-stone-400" />
                              <span>{COMPONENT_CONFIGS[key].label}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-stone-400">
                                W:{compMetric.weight}
                              </span>
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => onToggleComponent(sub.id, key, e.target.checked)}
                                title={isEnabled ? 'Component Active' : 'Component Inactive'}
                                className="w-3.5 h-3.5 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                              />
                            </div>
                          </div>

                          {/* Percentage & Status */}
                          <div className="mt-3 flex items-baseline justify-between">
                            <span
                              className={`text-xl font-bold font-mono tabular-nums ${
                                compMetric.conducted === 0
                                  ? 'text-stone-400'
                                  : compMetric.status === 'safe'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : compMetric.status === 'warning'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {compMetric.conducted > 0 ? `${compMetric.percentage}%` : '—'}
                            </span>

                            <span className="text-[11px] font-medium">
                              {compMetric.conducted > 0 &&
                                (compMetric.status === 'safe' ? (
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    {compMetric.safeBunks} safe
                                  </span>
                                ) : (
                                  <span className="text-rose-600 dark:text-rose-400">
                                    +{compMetric.recoveryNeeded} req
                                  </span>
                                ))}
                            </span>
                          </div>

                          {/* Counter Steppers */}
                          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                            {/* Attended Row */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-500 dark:text-stone-400">Attended:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={!isEnabled || compMetric.attended <= 0}
                                  onClick={() => onStepComponent(sub.id, key, 'attended', -1)}
                                  className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
                                  title="Minus 1 attended"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-mono font-semibold tabular-nums w-8 text-center text-stone-900 dark:text-stone-100">
                                  {compMetric.attended}
                                </span>
                                <button
                                  type="button"
                                  disabled={!isEnabled}
                                  onClick={() => onStepComponent(sub.id, key, 'attended', +1)}
                                  className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
                                  title="Plus 1 attended"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Conducted Row */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-500 dark:text-stone-400">Conducted:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={!isEnabled || compMetric.conducted <= 0}
                                  onClick={() => onStepComponent(sub.id, key, 'conducted', -1)}
                                  className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
                                  title="Minus 1 conducted"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-mono font-semibold tabular-nums w-8 text-center text-stone-900 dark:text-stone-100">
                                  {compMetric.conducted}
                                </span>
                                <button
                                  type="button"
                                  disabled={!isEnabled}
                                  onClick={() => onStepComponent(sub.id, key, 'conducted', +1)}
                                  className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
                                  title="Plus 1 conducted"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
