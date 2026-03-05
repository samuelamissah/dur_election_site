
import Image from 'next/image';
import { Candidate } from '../lib/data';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  return (
    <div 
      className={`relative flex flex-col items-center p-6 bg-white dark:bg-zinc-800 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
        isSelected 
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
          : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
      }`}
      onClick={() => onSelect(candidate.id)}
    >
      <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-zinc-100 dark:border-zinc-700 shadow-sm">
        <Image
          src={candidate.imageUrl || '/placeholder.jpg'} // Fallback if needed, though data has placeholders
          alt={candidate.name}
          fill
          className="object-cover"
        />
      </div>
      
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 text-center mb-1">
        {candidate.name}
      </h3>
      
      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
        {candidate.role}
      </p>
      
      <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mb-6 line-clamp-3">
        {candidate.bio}
      </p>
      
      <div className="mt-auto">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          isSelected 
            ? 'border-blue-600 bg-blue-600' 
            : 'border-zinc-300 dark:border-zinc-600'
        }`}>
          {isSelected && (
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
        </div>
      </div>
    </div>
  );
}
