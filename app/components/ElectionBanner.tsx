
import { AlertCircle } from 'lucide-react';

export default function ElectionBanner() {
  // Hardcoded date for now, could be fetched from API later
  const endDate = "March 15, 2026 at 5:00 PM";

  return (
    <div className="w-full bg-blue-600 text-white p-4 text-center font-medium flex items-center justify-center gap-2">
      <AlertCircle className="w-5 h-5" />
      <span>Election is open until {endDate}</span>
    </div>
  );
}
