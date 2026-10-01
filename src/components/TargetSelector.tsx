import { Target } from 'lucide-react';
import React, { useState } from 'react';

interface TargetSelectorProps {
  currentTarget: number;
  onSelectTarget: (target: number) => void;
  size?: 'sm' | 'md';
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({
  currentTarget,
  onSelectTarget,
}) => {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customVal, setCustomVal] = useState<string>(currentTarget.toString());

  const standardTargets = [75, 80, 85];
  const isCustom = !standardTargets.includes(currentTarget);

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(customVal);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      onSelectTarget(Number(parsed.toFixed(1)));
      setIsEditingCustom(false);
    } else {
      setCustomVal(currentTarget.toString());
      setIsEditingCustom(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
        <Target className="w-3.5 h-3.5 text-cyan-500" />
        <span className="hidden sm:inline">Target:</span>
      </div>

      <div className="inline-flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        {standardTargets.map((target) => {
          const isSelected = currentTarget === target && !isEditingCustom;
          return (
            <button
              key={target}
              type="button"
              onClick={() => {
                setIsEditingCustom(false);
                onSelectTarget(target);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {target}%
            </button>
          );
        })}

        {isEditingCustom ? (
          <form onSubmit={handleCustomSubmit} className="inline-flex items-center px-1">
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              autoFocus
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              onBlur={() => handleCustomSubmit()}
              className="w-14 px-1.5 py-0.5 text-xs text-center font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded border border-cyan-500 focus:outline-hidden"
              placeholder="75"
            />
            <span className="text-xs font-mono text-slate-400 ml-0.5">%</span>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCustomVal(currentTarget.toString());
              setIsEditingCustom(true);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              isCustom
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isCustom ? `${currentTarget}%` : 'Custom'}
          </button>
        )}
      </div>
    </div>
  );
};
