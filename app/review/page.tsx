
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ElectionBanner from '../components/ElectionBanner';
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft, Loader2, Send, LogOut, X } from 'lucide-react';
import { submitVote } from '../actions/vote';
import { createClient } from '../utils/supabase/client';
import { logoutStaff } from '../actions/auth';
import { ELECTION_END_DATE_STRING } from '../utils/election';
import { getElectionStatusClient } from '../actions/election';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ReviewPage() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [positions, setPositions] = useState<{ id: string; title: string; description: string }[]>([]);
  const [candidatesById, setCandidatesById] = useState<Record<string, { name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [electionStatus, setElectionStatus] = useState({ closed: false, open: true });
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('election_selections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Use a microtask to avoid synchronous setState in effect
        queueMicrotask(() => setSelections(parsed));
      } catch {
        router.push('/vote');
      }
    } else {
      router.push('/vote');
    }
  }, [router]);

  useEffect(() => {
    async function fetchSnapshot() {
      setLoading(true);
      const supabase = createClient();
      const { data: posData, error: posErr } = await supabase
        .from('positions')
        .select('slug,title,description,display_order')
        .order('display_order', { ascending: true });
      
      if (posErr) {
        setLoading(false);
        return;
      }
      
      setPositions((posData || []).map((p: any) => ({
        id: p.slug,
        title: p.title,
        description: p.description || '',
      })));

      const { data: candData } = await supabase.from('candidates').select('id,name,position_id');
      const byId: Record<string, { name: string }> = {};
      const posHasCandidates: Record<string, boolean> = {};
      (candData || []).forEach((c: any) => {
        byId[c.id] = { name: c.name };
        if (c.position_id) posHasCandidates[c.position_id] = true;
      });
      setCandidatesById(byId);
      
      setPositions((posData || []).filter((p: any) => posHasCandidates[p.slug]).map((p: any) => ({
        id: p.slug,
        title: p.title,
        description: p.description || '',
      })));
      
      const status = await getElectionStatusClient();
      setElectionStatus(status);
      setLoading(false);
    }
    fetchSnapshot();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitVote(selections);
      if (result.success) {
        localStorage.removeItem('election_selections');
        const urlParams = new URLSearchParams({
          refId: result.refId || '',
          name: result.staffName || ''
        });
        router.push(`/success?${urlParams.toString()}`);
      } else {
        setError(result.error || 'Failed to submit vote');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during submission.');
      setIsSubmitting(false);
    }
  };

  const isComplete = positions.length > 0 && positions.every(p => selections[p.id]);

  if (electionStatus.closed) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased flex flex-col items-center justify-center p-6">
        <ElectionBanner closed={electionStatus.closed} open={electionStatus.open} />
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Election Closed
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
            The welfare election officially concluded on <strong>{ELECTION_END_DATE_STRING}</strong>. 
            Voting is no longer permitted. Thank you to everyone who participated.
          </p>
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Preparing your ballot summary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 font-sans antialiased">
      <ElectionBanner closed={electionStatus.closed} open={electionStatus.open} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button 
            onClick={() => router.push('/vote')}
            className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 font-bold transition-colors group text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            Back<span className="hidden xs:inline"> to Ballot</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Final Review</span>
          </div>
          <form action={logoutStaff} className="ml-2">
            <button 
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-lg text-[10px] uppercase tracking-wider border border-red-100 dark:border-red-800/50 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-12 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2 sm:mb-3 tracking-tight">
              Review Your Selections
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Please verify your choices for each position before final submission. 
              <span className="hidden sm:inline"> Once submitted, your vote cannot be changed.</span>
            </p>
          </div>

          <div className="p-4 sm:p-12 space-y-4 sm:space-y-6">
            {positions.map((pos) => {
              const selection = selections[pos.id];
              const isNoVote = selection === 'NO_VOTE';
              const isSkipped = selection === 'SKIP';
              const candidateName = isNoVote ? 'NO VOTE (Abstained)' : isSkipped ? 'Skipped' : candidatesById[selection]?.name;

              return (
                <div 
                  key={pos.id}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all ${
                    candidateName 
                      ? (isNoVote || isSkipped)
                        ? 'bg-zinc-100/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-700 shadow-sm' 
                      : 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5 sm:mb-1">
                        {pos.title}
                      </p>
                      <h3 className={`text-lg sm:text-xl font-bold ${candidateName ? (isNoVote || isSkipped) ? 'text-zinc-500 dark:text-zinc-400 italic' : 'text-zinc-900 dark:text-zinc-100' : 'text-red-600 dark:text-red-400'}`}>
                        {candidateName || 'No Selection Made'}
                      </h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      {candidateName && (
                        <div className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-1 rounded-full border self-center ${
                          (isNoVote || isSkipped) 
                            ? 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
                            : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50'
                        }`}>
                          {(isNoVote || isSkipped) ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                            {isNoVote ? 'Abstained' : isSkipped ? 'Skipped' : 'Confirmed'}
                          </span>
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          const posIndex = positions.findIndex(p => p.id === pos.id);
                          if (posIndex !== -1) {
                            router.push(`/vote?step=${posIndex}`);
                          } else {
                            router.push('/vote');
                          }
                        }}
                        className="text-[10px] font-bold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mx-4 sm:mx-12 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="p-6 sm:p-12 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
              <ShieldCheck className="w-5 h-5 shrink-0 hidden sm:block" />
              <p className="text-[10px] sm:text-xs leading-tight">
                Your vote is encrypted and anonymous. <br className="hidden sm:block" />
                Submission is final and binding.
              </p>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isComplete}
              className={`flex items-center justify-center gap-2 px-8 sm:px-10 py-4 rounded-xl font-bold transition-all active:scale-[0.98] w-full sm:w-auto shadow-lg text-sm sm:text-base ${
                isComplete && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Cast Official Vote
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full py-10 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-auto">
        <div className="max-w-4xl mx-auto px-6">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">National Engineering Coordinating Team</p>
          <p>&copy; 2026 National Engineering Coordinating Team. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
