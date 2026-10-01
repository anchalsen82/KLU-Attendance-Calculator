import {
  AlertCircle,
  BookOpen,
  FlaskConical,
  Layers,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  COMPONENT_CONFIGS,
  ComponentType,
  Subject,
  SubjectComponents,
} from '../types/attendance';
import { COMPONENT_KEYS } from '../utils/calculations';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Subject>) => void;
  editingSubject: Subject | null;
  defaultTarget: number;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingSubject,
  defaultTarget,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<string>('4');
  const [targetPercentage, setTargetPercentage] = useState<string>('');

  const [components, setComponents] = useState<SubjectComponents>({
    lecture: { conducted: 20, attended: 18, enabled: true },
    practical: { conducted: 10, attended: 9, enabled: true },
    tutorial: { conducted: 5, attended: 4, enabled: true },
    skill: { conducted: 8, attended: 7, enabled: true },
    tcbr: { conducted: 4, attended: 3, enabled: true },
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSubject) {
      setCode(editingSubject.code || '');
      setName(editingSubject.name || '');
      setCredits(editingSubject.credits ? editingSubject.credits.toString() : '');
      setTargetPercentage(
        editingSubject.targetPercentage ? editingSubject.targetPercentage.toString() : ''
      );
      setComponents({
        lecture: {
          conducted: editingSubject.components.lecture?.conducted || 0,
          attended: editingSubject.components.lecture?.attended || 0,
          enabled: editingSubject.components.lecture?.enabled ?? true,
        },
        practical: {
          conducted: editingSubject.components.practical?.conducted || 0,
          attended: editingSubject.components.practical?.attended || 0,
          enabled: editingSubject.components.practical?.enabled ?? true,
        },
        tutorial: {
          conducted: editingSubject.components.tutorial?.conducted || 0,
          attended: editingSubject.components.tutorial?.attended || 0,
          enabled: editingSubject.components.tutorial?.enabled ?? true,
        },
        skill: {
          conducted: editingSubject.components.skill?.conducted || 0,
          attended: editingSubject.components.skill?.attended || 0,
          enabled: editingSubject.components.skill?.enabled ?? true,
        },
        tcbr: {
          conducted: editingSubject.components.tcbr?.conducted || 0,
          attended: editingSubject.components.tcbr?.attended || 0,
          enabled: editingSubject.components.tcbr?.enabled ?? true,
        },
      });
    } else {
      setCode('');
      setName('');
      setCredits('4');
      setTargetPercentage('');
      setComponents({
        lecture: { conducted: 0, attended: 0, enabled: true },
        practical: { conducted: 0, attended: 0, enabled: true },
        tutorial: { conducted: 0, attended: 0, enabled: false },
        skill: { conducted: 0, attended: 0, enabled: true },
        tcbr: { conducted: 0, attended: 0, enabled: false },
      });
    }
    setValidationError(null);
  }, [editingSubject, isOpen]);

  if (!isOpen) return null;

  const componentIcons: Record<ComponentType, React.ElementType> = {
    lecture: BookOpen,
    practical: FlaskConical,
    tutorial: Sliders,
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

      // Ensure attended <= conducted
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError('Please enter a course name');
      return;
    }

    // Validate attended vs conducted
    for (const key of COMPONENT_KEYS) {
      const comp = components[key];
      if (comp.enabled && comp.attended > comp.conducted) {
        setValidationError(
          `Attended classes (${comp.attended}) cannot exceed conducted classes (${comp.conducted}) in ${COMPONENT_CONFIGS[key].label}.`
        );
        return;
      }
    }

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      credits: credits ? parseFloat(credits) : undefined,
      targetPercentage: targetPercentage ? parseFloat(targetPercentage) : undefined,
      components,
    };

    if (editingSubject) {
      onUpdate(editingSubject.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              {editingSubject ? 'Edit Course Details' : 'Add New Course'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Enter course information and initial attendance numbers for all 5 components
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation alert */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Course Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 23CS2101"
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Credits (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="4"
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Custom Target % (Leave blank for global {defaultTarget}%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(e.target.value)}
                placeholder={`Global default (${defaultTarget}%)`}
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 5 Components Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                Course Components & Initial Classes
              </label>
              <span className="text-[11px] text-stone-400">
                Enable or disable components that apply to this course
              </span>
            </div>

            <div className="space-y-2.5">
              {COMPONENT_KEYS.map((key) => {
                const comp = components[key];
                const config = COMPONENT_CONFIGS[key];
                const Icon = componentIcons[key];
                const pct =
                  comp.conducted > 0 ? ((comp.attended / comp.conducted) * 100).toFixed(1) : '—';

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      !comp.enabled
                        ? 'opacity-50 bg-stone-50 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800'
                        : 'bg-white dark:bg-stone-800/40 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-[150px]">
                      <input
                        type="checkbox"
                        checked={comp.enabled}
                        onChange={(e) => handleComponentChange(key, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                        id={`check-${key}`}
                      />
                      <label
                        htmlFor={`check-${key}`}
                        className="text-xs font-semibold text-stone-900 dark:text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon className="w-3.5 h-3.5 text-stone-400" />
                        <span>{config.label}</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Attended */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-stone-500">Attended:</span>
                        <input
                          type="number"
                          min="0"
                          disabled={!comp.enabled}
                          value={comp.attended}
                          onChange={(e) => handleComponentChange(key, 'attended', e.target.value)}
                          className="w-16 px-2 py-1 text-center font-mono font-semibold bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white disabled:opacity-30"
                        />
                      </div>

                      {/* Conducted */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-stone-500">Conducted:</span>
                        <input
                          type="number"
                          min="0"
                          disabled={!comp.enabled}
                          value={comp.conducted}
                          onChange={(e) => handleComponentChange(key, 'conducted', e.target.value)}
                          className="w-16 px-2 py-1 text-center font-mono font-semibold bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white disabled:opacity-30"
                        />
                      </div>

                      {/* Current % */}
                      <div className="w-16 text-right font-mono text-xs font-bold text-stone-700 dark:text-stone-300">
                        {comp.enabled && comp.conducted > 0 ? `${pct}%` : '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {editingSubject ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
