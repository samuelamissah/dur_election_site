
import VotingDashboard from '../components/VotingDashboard';
import ElectionBanner from '../components/ElectionBanner';
import { isElectionClosed, ELECTION_END_DATE_STRING } from '../utils/election';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function VotePage() {
  if (isElectionClosed()) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased flex flex-col items-center justify-center p-6">
        <ElectionBanner />
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Election Closed
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
            The welfare election officially concluded on <strong>{ELECTION_END_DATE_STRING}</strong>. 
            Voting is no longer permitted. Thank you to everyone who participated.
          </p>
          <Link href="/" className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased">
      <ElectionBanner />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-center mb-8 sr-only">Voting Dashboard</h1>
        <VotingDashboard />
      </main>
    </div>
  );
}
