
import ElectionBanner from './components/ElectionBanner';
import LoginForm from './components/LoginForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans antialiased">
      <ElectionBanner />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 relative w-full max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6 tracking-tight">
            Department of <span className="text-blue-600">Urban Roads</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Welcome to the official 2026 Welfare Election Portal. 
            Please use your designated Staff ID to securely access your voting ballot.
          </p>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 p-8">
          <LoginForm />
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-center">
          <div className="p-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Secure Voting</h3>
            <p className="text-sm text-zinc-500 mt-1">End-to-end encrypted and confidential process.</p>
          </div>
          <div className="p-4 border-x border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Official Results</h3>
            <p className="text-sm text-zinc-500 mt-1">Validated and verified by the Election Committee.</p>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Support Available</h3>
            <p className="text-sm text-zinc-500 mt-1">Contact your HR department for any issues.</p>
          </div>
        </div>
      </main>

      <footer className="w-full py-10 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Department of Urban Roads</p>
          <p>&copy; 2026 Election Committee. All rights reserved. Managed by IT Division.</p>
        </div>
      </footer>
    </div>
  );
}
