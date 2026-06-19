
'use client';

import { Clock, Info, AlertTriangle } from 'lucide-react';
import { ELECTION_END_DATE_STRING, ELECTION_START_DATE_STRING } from '../utils/election';

export default function ElectionBanner({ closed, open }: { closed?: boolean, open?: boolean }) {
  if (closed) {
    return (
      <div className="w-full bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/50 py-3 px-6 text-center font-medium flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Elections officially closed as of {ELECTION_END_DATE_STRING}</span>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-800/50 py-3 px-6 text-center font-medium flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Elections will open on {ELECTION_START_DATE_STRING}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50 py-3 px-6 text-center font-medium flex items-center justify-center gap-3">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Elections are active. Closing on {ELECTION_END_DATE_STRING}</span>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-blue-600/60 dark:text-blue-400/60 ml-4 border-l border-blue-200 dark:border-blue-800/50 pl-4">
        <Info className="w-4 h-4" />
        <span className="text-xs font-normal">Your vote is private and secure.</span>
      </div>
    </div>
  );
}
