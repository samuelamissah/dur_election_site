'use client';

import { useState } from 'react';
import { requestOtp, verifyOtpAndLogin } from '../actions/auth';
import { ShieldCheck, Mail, KeyRound, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', email);

    try {
      const result = await requestOtp(formData);
      if (result && result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        setStep('otp');
        setIsLoading(false);
        setError('');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP sent to your email');
      return;
    }

    setIsLoading(true);
    setError('');

    // Clear any previous (stale) selections from this browser
    localStorage.removeItem('election_selections');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp', otp);

    try {
      const result = await verifyOtpAndLogin(formData);
      if (result && result.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
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
        {step === 'email' 
          ? 'Enter your official NECT Email Address to proceed.' 
          : `Enter the 6-digit OTP sent to ${email}`}
      </p>
      
      {step === 'email' ? (
        <form onSubmit={handleRequestOtp} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                spellCheck="false"
                placeholder="e.g. name@example.com"
                className={`block w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/20'} rounded-xl focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
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
            disabled={isLoading || !email.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Send OTP
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
              One-Time Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="otp"
                name="otp"
                autoComplete="one-time-code"
                spellCheck="false"
                maxLength={6}
                placeholder="• • • • • •"
                className={`block w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/20'} rounded-xl focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-center tracking-[0.5em] text-xl font-bold`}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
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

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify & Login
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setError('');
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-medium rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Use a different email
            </button>
          </div>
        </form>
      )}

      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center px-4 mt-8">
        By continuing, you agree to the National Engineering Coordinating Team&apos;s election integrity policies and data protection guidelines.
      </p>
    </div>
  );
}
