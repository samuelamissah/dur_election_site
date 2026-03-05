
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithStaffId } from '../actions/auth';
import { ShieldCheck, User, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId.trim()) {
      setError('Please enter your Staff ID');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('staffId', staffId);

    try {
      const result = await loginWithStaffId(formData);
      if (result && result.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
          <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2 text-center text-zinc-900 dark:text-zinc-100">Portal Authentication</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
        Enter your official DUR Staff ID to proceed to the ballot.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="staffId" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
            Staff ID Number
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="staffId"
              name="staffId"
              autoComplete="off"
              spellCheck="false"
              placeholder="e.g. DUR-2024-001"
              className={`block w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/20'} rounded-xl focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600`}
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setError('');
              }}
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-xs font-medium text-red-500 mt-1.5 ml-1 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !staffId.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Verify & Continue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center px-4">
          By continuing, you agree to the Department&apos;s election integrity policies and data protection guidelines.
        </p>
      </form>
    </div>
  );
}
