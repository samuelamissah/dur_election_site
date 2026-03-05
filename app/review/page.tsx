
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { POSITIONS } from '../lib/data';
import ElectionBanner from '../components/ElectionBanner';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { submitVote } from '../actions/vote';export default function ReviewPage() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('election_selections');
    if (saved) {
      setSelections(JSON.parse(saved));
    } else {
      // If no selections, redirect back to vote page
      router.push('/vote');
    }
  }, [router]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitVote(selections);
      
      if (result.success) {
        // Clear selections after successful submission
        localStorage.removeItem('election_selections');
        router.push('/success');
      } else {
        setError(result.error || 'Failed to submit vote');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const getCandidateName = (positionId: string, candidateId: string) => {
    const position = POSITIONS.find(p => p.id === positionId);
    const candidate = position?.candidates.find(c => c.id === candidateId);
    return candidate ? candidate.name : 'No selection';
  };

  const isComplete = POSITIONS.every(p => selections[p.id]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased">
      <ElectionBanner />
      
      <main className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 text-center">
          Review Your Selections
        </h1>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {POSITIONS.map(position => (
              <li key={position.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {position.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {position.description}
                  </p>
                </div>
                <div className="flex items-center">
                  {selections[position.id] ? (
                    <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
                      {getCandidateName(position.id, selections[position.id])}
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full font-medium">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Not Selected
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/vote')}
            className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Back to Ballot
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`px-8 py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center transition-all ${
              isComplete && !isSubmitting
                ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-zinc-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm & Submit Vote
              </>
            )}
          </button>
        </div>
        
        {!isComplete && (
          <p className="mt-4 text-center text-red-600 dark:text-red-400 font-medium">
            Please select a candidate for all positions before submitting.
          </p>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-center font-medium border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
