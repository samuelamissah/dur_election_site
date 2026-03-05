
import Link from 'next/link';
import { Landmark, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-blue-600 rounded-lg sm:rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight">
              <span className="hidden xs:inline">Department of </span>Urban Roads
            </span>
            <span className="text-[8px] sm:text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em]">
              Welfare Election 2026
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-8">
        <div className="hidden lg:flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-medium">Secure Portal</span>
        </div>
        <Link 
          href="/admin/login" 
          className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-md sm:border-none sm:p-0"
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}
