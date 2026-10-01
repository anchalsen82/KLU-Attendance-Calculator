import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  Download,
  FileCode,
  FlaskConical,
  HardDrive,
  Info,
  Layers,
  Moon,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  AppSettings,
  CalculationMode,
  COMPONENT_CONFIGS,
  ComponentType,
  Subject,
} from '../types/attendance';
import { COMPONENT_KEYS } from '../utils/calculations';
import { exportDataAsJSON, importDataFromJSON } from '../utils/storage';
import { DisclaimerBanner } from './DisclaimerBanner';
import { TargetSelector } from './TargetSelector';

interface SettingsViewProps {
  settings: AppSettings;
  subjects: Subject[];
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onUpdateWeight: (compType: ComponentType, weight: number) => void;
  onResetToSample: () => void;
  onClearAll: () => void;
  onImportData: (data: { subjects: Subject[]; settings: AppSettings }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  subjects,
  onUpdateSettings,
  onUpdateWeight,
  onResetToSample,
  onClearAll,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const componentIcons: Record<ComponentType, React.ElementType> = {
    lecture: BookOpen,
    practical: FlaskConical,
    tutorial: Sliders,
    skill: Sparkles,
    tcbr: Layers,
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importDataFromJSON(content);
        onImportData(imported);
      } catch (err: any) {
        alert(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Title Header */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
          Application Settings & Weight Configurations
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Customize component weightings, attendance threshold goals, appearance, and local backups
        </p>
      </div>

      {/* Section 1: Configurable Component Weights */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Component Weights (L / P / T / S / TCBR)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Adjust how each delivery type contributes to your overall attendance. Defaults reflect common KLU regulations.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  weights: { lecture: 1.0, practical: 1.5, tutorial: 1.0, skill: 1.0, tcbr: 1.0 },
                })
              }
              className="px-2.5 py-1 rounded font-medium hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
            >
              KLU Standard (P: 1.5)
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  weights: { lecture: 1.0, practical: 1.0, tutorial: 1.0, skill: 1.0, tcbr: 1.0 },
                })
              }
              className="px-2.5 py-1 rounded font-medium hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
            >
              Uniform (1.0 each)
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  weights: { lecture: 1.0, practical: 2.0, tutorial: 1.0, skill: 1.0, tcbr: 1.0 },
                })
              }
              className="px-2.5 py-1 rounded font-medium hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
            >
              Double Lab (P: 2.0)
            </button>
          </div>
        </div>

        {/* Weights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {COMPONENT_KEYS.map((key) => {
            const config = COMPONENT_CONFIGS[key];
            const currentWeight = settings.weights[key] ?? config.defaultWeight;
            const Icon = componentIcons[key];

            return (
              <div
                key={key}
                className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-stone-400" />
                    <span>{config.label}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {currentWeight}x
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  {config.description}
                </p>

                <div className="space-y-1">
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={currentWeight}
                    onChange={(e) => onUpdateWeight(key, parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>0.5x</span>
                    <span>1.5x</span>
                    <span>3.0x</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calculation Formula Selector */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Attendance Aggregation Formula
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'weighted_hours' as CalculationMode,
                title: 'Weighted Class Hours (Recommended)',
                description: 'Formula: Σ(Weight × Attended) / Σ(Weight × Conducted) × 100',
              },
              {
                id: 'component_average' as CalculationMode,
                title: 'Component Percent Average',
                description: 'Formula: Average of each component percentage weighted by credit factor.',
              },
              {
                id: 'unweighted_simple' as CalculationMode,
                title: 'Unweighted Pure Sum',
                description: 'Formula: Total Attended Classes / Total Conducted Classes × 100.',
              },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onUpdateSettings({ calculationMode: mode.id })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.calculationMode === mode.id
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500 shadow-2xs'
                    : 'bg-stone-50/50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 dark:text-white">
                    {mode.title}
                  </span>
                  {settings.calculationMode === mode.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-mono">
                  {mode.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Target & Appearance Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target Attendance */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Default Target Attendance
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Set university requirement (e.g. 75% for regular exam admittance or 85% for condonation exemption)
            </p>
          </div>

          <div className="pt-2">
            <TargetSelector
              currentTarget={settings.targetPercentage}
              onSelectTarget={(t) => onUpdateSettings({ targetPercentage: t })}
            />
          </div>
        </div>

        {/* Theme Preference */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Display Theme
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Choose your preferred visual theme or sync with system preferences
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System Auto', icon: Sliders },
            ].map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = settings.theme === themeOption.id;
              return (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => onUpdateSettings({ theme: themeOption.id as any })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-transparent shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{themeOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Data Management, Backup & Reset */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-white">
            Data Storage & Backups
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            All your attendance data is securely kept in your local browser (localStorage). No login, no cloud transmission, 100% private.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={() => exportDataAsJSON(subjects, settings)}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Restore Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          {/* Reset to Sample */}
          <button
            type="button"
            onClick={onResetToSample}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Reload Sample Subjects</span>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Section 4: Local Run Instructions */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-stone-900 dark:text-white">
            Run This Application Locally
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          This project runs as a lightweight Vite + React + Tailwind CSS client. You can clone and run it directly on your machine:
        </p>

        <div className="bg-stone-950 text-stone-100 rounded-xl p-4 font-mono text-xs space-y-3 overflow-x-auto relative">
          <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-2">
            <span>Terminal Commands</span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  `# 1. Install dependencies\nnpm install\n\n# 2. Start local development server\nnpm run dev\n\n# 3. Build production bundle\nnpm run build`,
                  'cli'
                )
              }
              className="flex items-center gap-1 text-[11px] text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedCode === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'cli' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="text-stone-300 leading-relaxed">
            <span className="text-stone-500"># 1. Install project dependencies</span>{'\n'}
            <span className="text-emerald-400">npm</span> install{'\n\n'}
            <span className="text-stone-500"># 2. Start Vite development server on port 3000</span>{'\n'}
            <span className="text-emerald-400">npm</span> run dev{'\n\n'}
            <span className="text-stone-500"># 3. Build optimized production bundle</span>{'\n'}
            <span className="text-emerald-400">npm</span> run build
          </pre>
        </div>
      </div>

      {/* University ERP Disclaimer Banner */}
      <DisclaimerBanner />
    </div>
  );
};
