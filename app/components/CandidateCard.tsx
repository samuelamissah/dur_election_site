
import { useState } from 'react';
import Image from 'next/image';
import { User, Check } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  const [imageError, setImageError] = useState(false);

  const safeSrc = (() => {
    const u = candidate.imageUrl || '';
    const s = u.trim().replace(/[)\s]+$/, '');
    if (!s || !s.startsWith('http')) return '';
    return s;
  })();

  const initials = candidate.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() || '')
    .join('');

  return (
    <div 
      className={`group relative flex flex-col items-center p-6 sm:p-8 bg-white dark:bg-zinc-800/50 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected 
          ? 'border-blue-600 ring-4 ring-blue-600/10 bg-blue-50/30 dark:bg-blue-900/10 shadow-xl shadow-blue-500/10 scale-[1.02]' 
          : 'border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
      }`}
      onClick={() => onSelect(candidate.id)}
    >
      {/* Selection Badge */}
      <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
        isSelected ? 'bg-blue-600 text-white scale-110' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 scale-90'
      }`}>
        <Check className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-500">
        <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-300 ${
          isSelected ? 'border-blue-600/20' : 'border-zinc-100 dark:border-zinc-800'
        }`} />
        <div className="w-full h-full rounded-full overflow-hidden shadow-inner relative">
          {safeSrc && !imageError ? (
            <Image
              src={safeSrc}
              alt={candidate.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-black">
              <User className="w-8 h-8 sm:w-12 sm:h-12 mb-1 opacity-20" />
              <span className="text-xl sm:text-2xl tracking-tighter">{initials}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center space-y-1 sm:space-y-2 mb-4 sm:mb-6">
        <h3 className={`text-lg sm:text-xl font-extrabold transition-colors duration-300 ${
          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'
        }`}>
          {candidate.name}
        </h3>
        
        {candidate.role && (
          <div className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 rounded-full border border-zinc-200 dark:border-zinc-700">
            {candidate.role}
          </div>
        )}
      </div>
      
      {candidate.bio && (
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center line-clamp-2 sm:line-clamp-3 leading-relaxed px-2 italic">
          &ldquo;{candidate.bio}&rdquo;
        </p>
      )}

      <div className={`mt-6 sm:mt-8 w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
        isSelected 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600'
      }`}>
        {isSelected ? 'Selected' : 'Choose Candidate'}
      </div>
    </div>
  );
}
