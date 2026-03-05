
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CandidateCard from './CandidateCard';
import { ChevronRight, ChevronLeft, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function VotingDashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [positions, setPositions] = useState<
    { id: string; title: string; description: string; candidates: Array<{ id: string; name: string; role?: string; bio?: string; imageUrl?: string }> }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('election_selections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Use a microtask to avoid synchronous setState in effect
        queueMicrotask(() => setSelections(parsed));
      } catch {}
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
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

      const results = await Promise.all(
        (posData || []).map(p => 
          supabase.from('candidates').select('id,name,role,bio,image_url').eq('position_id', p.slug)
        )
      );

      const positionsMapped = (posData || []).map((p: any, idx: number) => ({
        id: p.slug,
        title: p.title,
        description: p.description || '',
        candidates: (results[idx].data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          role: c.role || '',
          bio: c.bio || '',
          imageUrl: c.image_url || '',
        })),
      }));

      setPositions(positionsMapped);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (positions.length === 0) return;
    // Use a microtask to avoid synchronous setState in effect
    queueMicrotask(() => {
      setSelections(prev => {
        const next = { ...prev };
        let changed = false;
        positions.forEach(pos => {
          const sel = next[pos.id];
          if (sel && !pos.candidates.some(c => c.id === sel)) {
            delete next[pos.id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    });
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('election_selections', JSON.stringify(selections));
  }, [selections]);

  const handleSelect = (candidateId: string) => {
    const pos = positions[currentStep];
    if (!pos) return;
    setSelections(prev => ({
      ...prev,
      [pos.id]: candidateId,
    }));
  };

  const handleNext = () => {
    if (currentStep < positions.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/review');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading secure ballot...</p>
      </div>
    );
  }

  const currentPos = positions[currentStep];
  const progress = ((currentStep + 1) / positions.length) * 100;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Progress Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Step {currentStep + 1} of {positions.length}
          </span>
          <span className="text-sm font-medium text-zinc-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="hidden sm:flex justify-between mt-4">
          {positions.map((pos, idx) => (
            <div 
              key={pos.id}
              className={`flex flex-col items-center gap-2 ${idx <= currentStep ? 'text-blue-600' : 'text-zinc-300'}`}
            >
              <div className={`w-2 h-2 rounded-full ${idx < currentStep ? 'bg-blue-600' : idx === currentStep ? 'bg-blue-600 animate-pulse' : 'bg-zinc-200'}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter truncate max-w-[80px]">
                {pos.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-12 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
                {currentPos.title}
              </h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {currentPos.description}
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/50 self-start sm:self-center">
              <Info className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">Select one candidate</span>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {currentPos.candidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPos.candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={selections[currentPos.id] === candidate.id}
                  onSelect={() => handleSelect(candidate.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">No candidates found</h3>
              <p className="text-zinc-500">There are currently no candidates registered for this position.</p>
            </div>
          )}
        </div>

        <div className="p-8 sm:p-12 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={!selections[currentPos.id]}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98] group"
          >
            {currentStep === positions.length - 1 ? (
              <>
                Review Ballot
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            ) : (
              <>
                Next Position
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-medium">Your progress is automatically saved to this device.</span>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
