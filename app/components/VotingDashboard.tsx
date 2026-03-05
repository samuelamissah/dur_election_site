
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CandidateCard from './CandidateCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';
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

  // Load saved selections on mount
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

  // Fetch positions and candidates from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      const { data: posData, error: posErr } = await supabase
        .from('positions')
        .select('slug,title,description,display_order')
        .order('display_order', { ascending: true });
      if (posErr) {
        console.error('Positions fetch error:', posErr);
        setPositions([]);
        setLoading(false);
        return;
      }
      const slugs = (posData || []).map((p: any) => p.slug);
      const candidatePromises = slugs.map((slug: string) =>
        supabase.from('candidates').select('id,name,role,bio,image_url').eq('position_id', slug)
      );
      const results = await Promise.all(candidatePromises);
      const positionsMapped = (posData || []).map((p: any, idx: number) => {
        const candRes = results[idx];
        const candList = candRes && !candRes.error ? (candRes.data || []) : [];
        return {
          id: p.slug,
          title: p.title,
          description: p.description || '',
          candidates: candList.map((c: any) => ({
            id: c.id,
            name: c.name,
            role: c.role || '',
            bio: c.bio || '',
            imageUrl: c.image_url || '',
          })),
        };
      });
      setPositions(positionsMapped);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Reconcile selections with current DB candidates to avoid stale IDs
  useEffect(() => {
    if (positions.length === 0) return;
    setSelections(prev => {
      const next = { ...prev };
      positions.forEach(pos => {
        const sel = next[pos.id];
        if (sel && !pos.candidates.some(c => c.id === sel)) {
          delete next[pos.id];
        }
      });
      return next;
    });
  }, [positions]);

  // Auto-save selections
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
      window.scrollTo(0, 0);
    } else {
      router.push('/review');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const currentPosition = positions[currentStep];
  const isSelected = currentPosition ? !!selections[currentPosition.id] : false;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {loading ? (
        <div className="w-full text-center py-12 text-zinc-500">Loading ballot…</div>
      ) : positions.length === 0 ? (
        <div className="w-full text-center py-12 text-zinc-500">No positions available.</div>
      ) : (
        <>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-zinc-500">
            Position {currentStep + 1} of {positions.length}
          </span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {Math.round(((currentStep + 1) / positions.length) * 100)}% Completed
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentStep + 1) / positions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Position Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {currentPosition?.title}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {currentPosition?.description}
        </p>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 place-items-center">
        {currentPosition?.candidates?.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={{
              id: candidate.id,
              name: candidate.name,
              role: candidate.role || '',
              bio: candidate.bio || '',
              imageUrl: candidate.imageUrl || '',
            }}
            isSelected={selections[currentPosition.id] === candidate.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'text-zinc-400 cursor-not-allowed'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!isSelected}
          className={`flex items-center px-8 py-3 rounded-lg font-semibold shadow-sm transition-all ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
          }`}
        >
          {currentStep === positions.length - 1 ? 'Review Selection' : 'Next Position'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
        </>
      )}
    </div>
  );
}
