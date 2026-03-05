
import ElectionBanner from './components/ElectionBanner';
import LoginForm from './components/LoginForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans antialiased">
      <ElectionBanner />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 relative w-full max-w-5xl">
        {/* Admin Link - Hidden/Subtle */}
        <div className="absolute top-4 right-4">
          <Link 
            href="/admin/login" 
            className="text-xs text-zinc-300 hover:text-zinc-500 dark:text-zinc-700 dark:hover:text-zinc-500 transition-colors"
          >
            Admin Access
          </Link>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-4">
            Department of Urban Roads Welfare Election 2026
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Welcome to the official voting portal. Please log in with your Staff ID to cast your vote.
          </p>
        </div>

        <LoginForm />
      </main>

      <footer className="w-full py-6 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
        &copy; 2026 Election Committee. All rights reserved.
      </footer>
    </div>
  );
}
