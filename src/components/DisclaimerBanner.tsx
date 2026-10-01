import { AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import React from 'react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 text-stone-700 dark:text-stone-300 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <span>Independent Academic Utility</span>
            <span className="text-[11px] font-normal text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md">
              Unofficial
            </span>
          </p>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            This calculator is an independent planning tool built for students of Kalasalingam Academy of Research and Education (KLU / KARE) to estimate attendance, safe bunks, and recovery classes.
            Official attendance records, condonation eligibility, and exam admittance must always be verified via the official university SIS portal (<code className="font-mono text-xs">sis.kalasalingam.ac.in</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
