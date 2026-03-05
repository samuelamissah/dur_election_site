
import { Clock, Info } from 'lucide-react';

export default function ElectionBanner() {
  const endDate = "March 15, 2026 at 5:00 PM";

  return (
    <div className="w-full bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50 py-3 px-6 text-center font-medium flex items-center justify-center gap-3">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Elections are active. Closing on {endDate}</span>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-blue-600/60 dark:text-blue-400/60 ml-4 border-l border-blue-200 dark:border-blue-800/50 pl-4">
        <Info className="w-4 h-4" />
        <span className="text-xs font-normal">Your vote is private and secure.</span>
      </div>
    </div>
  );
}
