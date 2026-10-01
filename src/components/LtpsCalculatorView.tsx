import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Copy,
  FlaskConical,
  GraduationCap,
  Layers,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  AppSettings,
  COMPONENT_CONFIGS,
  ComponentType,
  Subject,
  SubjectComponents,
} from '../types/attendance';
import {
  calculateBunksAndRecovery,
  COMPONENT_KEYS,
  determineStatus,
} from '../utils/calculations';
import { DisclaimerBanner } from './DisclaimerBanner';
import { TargetSelector } from './TargetSelector';

interface LtpsCalculatorViewProps {
  settings: AppSettings;
  targetPercentage: number;
  onUpdateTarget: (target: number) => void;
  onAddSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onNavigateToSubjects: () => void;
}

export const LtpsCalculatorView: React.FC<LtpsCalculatorViewProps> = ({
  settings,
  targetPercentage,
  onUpdateTarget,
  onAddSubject,
  onNavigateToSubjects,
}) => {
  const [courseName, setCourseName] = useState<string>('Course Component Attendance');
  const [courseCode, setCourseCode] = useState<string>('23CSXXXX');

  const [components, setComponents] = useState<SubjectComponents>({
    lecture: { conducted: 26, attended: 23, enabled: true },
    tutorial: { conducted: 6, attended: 5, enabled: true },
    practical: { conducted: 12, attended: 10, enabled: true },
    skill: { conducted: 8, attended: 7, enabled: true },
    tcbr: { conducted: 4, attended: 3, enabled: true },
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const componentIcons: Record<ComponentType, React.ElementType> = {
    lecture: BookOpen,
    tutorial: Sliders,
    practical: FlaskConical,
    skill: Sparkles,
    tcbr: Layers,
  };

  const handleComponentChange = (
    key: ComponentType,
    field: 'conducted' | 'attended' | 'enabled',
    value: any
  ) => {
    setComponents((prev) => {
      const current = prev[key];
      let updatedConducted = field === 'conducted' ? Math.max(0, Number(value)) : current.conducted;
      let updatedAttended = field === 'attended' ? Math.max(0, Number(value)) : current.attended;
      let updatedEnabled = field === 'enabled' ? Boolean(value) : current.enabled;

      if (field === 'conducted' && updatedAttended > updatedConducted) {
        updatedAttended = updatedConducted;
      }
      if (field === 'attended' && updatedAttended > updatedConducted) {
        setValidationError(`Attended classes cannot exceed conducted for ${COMPONENT_CONFIGS[key].label}`);
      } else {
        setValidationError(null);
      }

      return {
        ...prev,
        [key]: {
          conducted: updatedConducted,
          attended: updatedAttended,
          enabled: updatedEnabled,
        },
      };
    });
  };

  const handleReset = () => {
    setComponents({
      lecture: { conducted: 0, attended: 0, enabled: true },
      tutorial: { conducted: 0, attended: 0, enabled: true },
      practical: { conducted: 0, attended: 0, enabled: true },
      skill: { conducted: 0, attended: 0, enabled: true },
      tcbr: { conducted: 0, attended: 0, enabled: true },
    });
    setValidationError(null);
  };

  // Perform calculation
  let totalConducted = 0;
  let totalAttended = 0;
  let weightedAttended = 0;
  let weightedConducted = 0;

  const componentResults = COMPONENT_KEYS.map((key) => {
    const comp = components[key];
    const weight = settings.weights[key] ?? COMPONENT_CONFIGS[key].defaultWeight;
    const conducted = comp.enabled ? comp.conducted : 0;
    const attended = comp.enabled ? Math.min(conducted, comp.attended) : 0;

    const { safeBunks, recoveryNeeded, percentage } = calculateBunksAndRecovery(
      attended,
      conducted,
      targetPercentage
    );
    const status = determineStatus(percentage, targetPercentage, conducted);

    if (comp.enabled && conducted > 0) {
      totalConducted += conducted;
      totalAttended += attended;
      weightedAttended += attended * weight;
      weightedConducted += conducted * weight;
    }

    return {
      key,
      label: COMPONENT_CONFIGS[key].label,
      shortLabel: COMPONENT_CONFIGS[key].shortLabel,
      enabled: comp.enabled,
      conducted,
      attended,
      weight,
      percentage: Number(percentage.toFixed(1)),
      safeBunks,
      recoveryNeeded,
      status,
      icon: componentIcons[key],
    };
  });

  const overallWeightedPercentage =
    weightedConducted > 0 ? Number(((weightedAttended / weightedConducted) * 100).toFixed(2)) : 0;

  const overallUnweightedPercentage =
    totalConducted > 0 ? Number(((totalAttended / totalConducted) * 100).toFixed(2)) : 0;

  const displayPercentage =
    settings.calculationMode === 'unweighted_simple'
      ? overallUnweightedPercentage
      : overallWeightedPercentage;

  const overallStatus = determineStatus(displayPercentage, targetPercentage, totalConducted);

  const { safeBunks: overallSafeBunks, recoveryNeeded: overallRecoveryNeeded } =
    calculateBunksAndRecovery(totalAttended, totalConducted, targetPercentage);

  const handleSaveToSubjects = () => {
    onAddSubject({
      code: courseCode.trim().toUpperCase() || '23CSXXXX',
      name: courseName.trim() || 'L-T-P-S Course',
      components,
    });
    onNavigateToSubjects();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Target Selector Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-stone-900 dark:text-white">
            Component Attendance Configuration
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Current calculation mode:{' '}
            <strong className="text-stone-700 dark:text-stone-300">
              {settings.calculationMode === 'weighted_hours'
                ? 'Weighted Class Hours'
                : settings.calculationMode === 'component_average'
                ? 'Component Average'
                : 'Unweighted Pure Sum'}
            </strong>
          </p>
        </div>
        <TargetSelector
          currentTarget={targetPercentage}
          onSelectTarget={onUpdateTarget}
        />
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 shadow-xs space-y-8">
        <div className="border-b border-stone-100 dark:border-stone-800 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Attendance by L-T-P-S & TCBR
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Input classes for Lecture (L), Tutorial (T), Practical / Lab (P), Skill (S), and TCBR to compute weighted standing
          </p>
        </div>

        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 5 Component Inputs Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {componentResults.map((comp) => {
              const Icon = comp.icon;
              return (
                <div
                  key={comp.key}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    !comp.enabled
                      ? 'opacity-50 bg-stone-100/60 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800'
                      : 'bg-stone-50/70 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={comp.enabled}
                        onChange={(e) => handleComponentChange(comp.key, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        id={`comp-${comp.key}`}
                      />
                      <label
                        htmlFor={`comp-${comp.key}`}
                        className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-stone-400" />
                        <span>{comp.label}</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-stone-400">Weight: {comp.weight}x</span>
                      {comp.conducted > 0 && (
                        <span
                          className={`font-mono font-bold ${
                            comp.status === 'safe'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : comp.status === 'warning'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {comp.percentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                        Conducted Classes
                      </span>
                      <input
                        type="number"
                        min="0"
                        disabled={!comp.enabled}
                        value={components[comp.key].conducted || ''}
                        onChange={(e) => handleComponentChange(comp.key, 'conducted', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-stone-900 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500 disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                        Attended Classes
                      </span>
                      <input
                        type="number"
                        min="0"
                        disabled={!comp.enabled}
                        value={components[comp.key].attended || ''}
                        onChange={(e) => handleComponentChange(comp.key, 'attended', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-stone-900 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-blue-500 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {comp.enabled && comp.conducted > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">
                        {comp.attended} / {comp.conducted} classes
                      </span>
                      {comp.status === 'safe' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {comp.safeBunks} safe bunks
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          Attend next {comp.recoveryNeeded}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons: Calculate / Save / Reset */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveToSubjects}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Save to Subject Attendance</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-stone-500" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Aggregate Calculated Results */}
        {totalConducted > 0 && (
          <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 p-5 sm:p-6 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Overall Weighted Attendance
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-stone-900 dark:text-white">
                    {displayPercentage}%
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                      overallStatus === 'safe'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : overallStatus === 'warning'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {overallStatus === 'safe' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Safe Standing</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Shortage Risk</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-mono">
                  {totalAttended} of {totalConducted} classes attended across all components
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Target: {targetPercentage}%
                </span>
                <div className="mt-1">
                  {overallStatus === 'safe' ? (
                    <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {overallSafeBunks} Safe Bunks
                    </div>
                  ) : (
                    <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                      Attend next {overallRecoveryNeeded}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
};
