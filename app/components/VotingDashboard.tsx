
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { POSITIONS } from '../lib/data';
import CandidateCard from './CandidateCard'; // Ensure this path is correct
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function VotingDashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const router = useRouter();

  // Load saved selections on mount
  useEffect(() => {
    const saved = localStorage.getItem('election_selections');
    if (saved) {
      setSelections(JSON.parse(saved));
    }
  }, []);

  // Auto-save selections
  useEffect(() => {
    localStorage.setItem('election_selections', JSON.stringify(selections));
  }, [selections]);

  const handleSelect = (candidateId: string) => {
    setSelections(prev => ({
      ...prev,
      [POSITIONS[currentStep].id]: candidateId
    }));
  };

  const handleNext = () => {
    if (currentStep < POSITIONS.length - 1) {
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

  const currentPosition = POSITIONS[currentStep];
  const isSelected = !!selections[currentPosition.id];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-zinc-500">
            Position {currentStep + 1} of {POSITIONS.length}
          </span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {Math.round(((currentStep + 1) / POSITIONS.length) * 100)}% Completed
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentStep + 1) / POSITIONS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Position Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {currentPosition.title}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {currentPosition.description}
        </p>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 place-items-center">
        {currentPosition.candidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selections[currentPosition.id] === candidate.id}
            onSelect={handleSelect}
          /> // Missing closing parenthesis was fixed here in my thought process, but let's check code
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
          {currentStep === POSITIONS.length - 1 ? 'Review Selection' : 'Next Position'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
