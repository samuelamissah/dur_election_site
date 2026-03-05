
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Home, ShieldCheck, Download, Mail } from 'lucide-react';
import ElectionBanner from '../components/ElectionBanner';
import Link from 'next/link';
/* eslint-disable @typescript-eslint/no-explicit-any */

function SuccessContent() {
  const searchParams = useSearchParams();
  const [refId, setRefId] = useState<string>('');

  useEffect(() => {
    const id = searchParams.get('refId') || 'DUR-REF-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    // Use a microtask to avoid synchronous setState in effect
    queueMicrotask(() => setRefId(id));
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="mb-10 relative inline-block">
        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative bg-white dark:bg-zinc-900 p-6 rounded-full shadow-2xl shadow-green-500/20 border-8 border-green-50 dark:border-green-900/20">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6 tracking-tight">
        Vote Cast Successfully
      </h1>
      
      <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-12 leading-relaxed max-w-lg mx-auto">
        Your participation in the 2026 Welfare Election is confirmed. 
        Your selections have been encrypted and securely stored.
      </p>
      
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-12 min-h-[180px] flex flex-col justify-center">
        {refId ? (
          <>
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                Official Receipt ID
              </p>
              <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter">
                {refId}
              </p>
            </div>
            
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-left p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Immutable</p>
                  <p className="text-[10px] text-zinc-500">Recorded on secure ledger</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Confirmation</p>
                  <p className="text-[10px] text-zinc-500">Sent to official email</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-zinc-400 text-sm">Generating receipt...</div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 py-4 px-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
        >
          <Home className="w-5 h-5" />
          Exit Portal
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 py-4 px-8 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 font-bold rounded-xl shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all w-full sm:w-auto"
        >
          <Download className="w-5 h-5" />
          Print Receipt
        </button>
      </div>

      <p className="mt-12 text-xs text-zinc-400 dark:text-zinc-500 max-w-md mx-auto">
        Please retain your Reference ID for any future inquiries. 
        Your individual selections remain strictly confidential and are not listed on this receipt.
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 font-sans antialiased flex flex-col">
      <ElectionBanner />
      
      <main className="flex-1 flex flex-col justify-center">
        <Suspense fallback={<div className="text-center py-20 text-zinc-500">Finalizing receipt...</div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="w-full py-10 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-auto">
        <div className="max-w-4xl mx-auto px-6">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Department of Urban Roads</p>
          <p>&copy; 2026 Election Committee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
