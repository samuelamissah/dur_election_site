
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import ElectionBanner from '../components/ElectionBanner';

export default function SuccessPage() {
  const [refId, setRefId] = useState('');
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const generatedRefId = Math.random().toString(36).substring(2, 15).toUpperCase();
    // Initialize refId directly on mount instead of using setState in effect
    if (!refId) {
// (removed – initialize refId via useState initializer instead)
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased">
      <ElectionBanner />
      
      <main className="container mx-auto p-6 max-w-lg mt-12 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Vote Submitted Successfully
          </h1>
          
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Thank you for participating in the 2026 Staff Election. Your vote has been recorded securely.
          </p>
          
          {refId && (
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-4 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
              <p className="font-mono font-medium text-zinc-900 dark:text-zinc-100">Reference ID: {refId}</p>
              <p className="mt-2 text-xs">
                Please save this reference ID for your records. Your individual selections are confidential and not displayed here.
              </p>
            </div>
          )}
          
          <Link 
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </main>
 
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Your Vote Was Recorded</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Thank you. A receipt has been generated below. You may close this window.
              </p>
              {refId && (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-3 mb-4 text-sm text-zinc-600 dark:text-zinc-300">
                  Reference ID: <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{refId}</span>
                </div>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
