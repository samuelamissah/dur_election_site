
import ElectionBanner from './components/ElectionBanner';
import LoginForm from './components/LoginForm';
import { ELECTION_END_DATE_STRING, ELECTION_START_DATE_STRING } from './utils/election';
import { isElectionClosed, isElectionOpen } from './actions/election';
import { AlertTriangle, Clock } from 'lucide-react';

export default async function Home() {
  const closed = await isElectionClosed();
  const open = await isElectionOpen();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans antialiased">
      <ElectionBanner closed={closed} open={open} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-20 relative w-full max-w-5xl">
        <div className="mb-10 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-6xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-4 sm:mb-6 tracking-tight">
            National Engineering <span className="text-blue-600">Coordinating Team</span>
          </h1>
          <p className="text-base sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Welcome to the official 2026 Election Portal. 
            Please use your designated Email Address to securely access your voting ballot.
          </p>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
          {closed ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Voting Closed</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                The welfare election concluded on {ELECTION_END_DATE_STRING}. Voting is no longer permitted.
              </p>
            </div>
          ) : !open ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Voting Not Started</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                The welfare election will start on {ELECTION_START_DATE_STRING}. Please return then to cast your vote.
              </p>
            </div>
          ) : (
            <LoginForm />
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl text-center">
          <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 sm:border-none sm:bg-transparent">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">Secure Voting</h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">End-to-end encrypted and confidential process.</p>
          </div>
          <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 sm:border-x sm:border-y-0 sm:border-zinc-100 dark:sm:border-zinc-800 sm:rounded-none sm:bg-transparent">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">Official Results</h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">Validated and verified by the Election Committee.</p>
          </div>
          <div className="p-4 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 sm:border-none sm:bg-transparent">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">Support Available</h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">Contact your HR  for any issues.</p>
          </div>
        </div>
      </main>

      <footer className="w-full py-10 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">National Engineering Coordinating Team</p>
          <p>&copy; 2026 National Engineering Coordinating Team. All rights reserved. Managed by IT Division.</p>
        </div>
      </footer>
    </div>
  );
}
