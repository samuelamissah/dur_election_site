'use client';

import { useState } from 'react';
import { verifyStaffDob } from '../actions/auth';
import { ShieldCheck, Calendar, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { logoutStaff } from '../actions/auth';
import ElectionBanner from '../components/ElectionBanner';

export default function VerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await verifyStaffDob(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased flex flex-col">
      <ElectionBanner />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                  <div className="relative bg-blue-600 p-4 rounded-2xl shadow-xl">
                    <ShieldCheck className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
                  Verification Required
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Please verify your identity by entering your Date of Birth to proceed  voting.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="dob" className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">
                    Date of Birth
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <input
                      id="dob"
                      name="dob"
                      type="date"
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-zinc-100 font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all appearance-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <form action={logoutStaff}>
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cancel & Logout
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-relaxed">
            Secure Verification System v2.0 <br />
            &copy; 2026 DUR Election Committee
          </p>
        </div>
      </main>
    </div>
  );
}
