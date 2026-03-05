
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // For prototype, we'll use a hardcoded check
    if (email === 'admin@election.com' && password === 'admin123') {
      localStorage.setItem('admin_session', 'true');
      router.push('/admin');
    } else {
      setError('Invalid administrative credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-center text-zinc-900 dark:text-zinc-50 mb-2 tracking-tight">
            Admin Access
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-10">
            Authorized personnel only. Please sign in to manage the election portal.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">
                Admin Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  placeholder="admin@election.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">
                Security Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                  <Key className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Secure Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tighter">
            Managed by IT Division &bull; Department of Urban Roads
          </p>
        </div>
      </div>
    </div>
  );
}
