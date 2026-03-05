
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // TODO: Implement actual authentication with Supabase
    // For prototype, we'll use a hardcoded check
    if (email === 'admin@election.com' && password === 'admin123') {
      // Set a cookie or local storage to indicate admin session
      localStorage.setItem('admin_session', 'true');
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="w-full max-w-md bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-6">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@election.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
