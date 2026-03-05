
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ElectionBanner from '../components/ElectionBanner';
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft, Loader2, Send } from 'lucide-react';
import { submitVote } from '../actions/vote';
import { createClient } from '../utils/supabase/client';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ReviewPage() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [positions, setPositions] = useState<{ id: string; title: string; description: string }[]>([]);
  const [candidatesById, setCandidatesById] = useState<Record<string, { name: string }>>({});
  const [loading, setLoading] = useState(true);
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

      const { data: candData } = await supabase.from('candidates').select('id,name');
      const byId: Record<string, { name: string }> = {};
      (candData || []).forEach((c: any) => {
        byId[c.id] = { name: c.name };
      });
      setCandidatesById(byId);
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
        router.push(`/success?refId=${result.refId || ''}`);
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
      <ElectionBanner />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/vote')}
            className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 font-bold transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Ballot
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Final Review</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-12 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
              Review Your Selections
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Please verify your choices for each position before final submission. 
              Once submitted, your vote cannot be changed.
            </p>
          </div>

          <div className="p-8 sm:p-12 space-y-6">
            {positions.map((pos) => {
              const candidateId = selections[pos.id];
              const candidateName = candidatesById[candidateId]?.name;

              return (
                <div 
                  key={pos.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    candidateName 
                      ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-700 shadow-sm' 
                      : 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        {pos.title}
                      </p>
                      <h3 className={`text-xl font-bold ${candidateName ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-600 dark:text-red-400'}`}>
                        {candidateName || 'No Selection Made'}
                      </h3>
                    </div>
                    {candidateName && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800/50">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mx-8 sm:mx-12 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="p-8 sm:p-12 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-5 h-5" />
              <p className="text-xs leading-tight">
                Your vote is encrypted and anonymous. <br className="hidden sm:block" />
                Submission is final and binding.
              </p>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isComplete}
              className={`flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold transition-all active:scale-[0.98] w-full sm:w-auto shadow-lg ${
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
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Department of Urban Roads</p>
          <p>&copy; 2026 Election Committee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
