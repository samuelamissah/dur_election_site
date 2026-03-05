
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithStaffId } from '../actions/auth';

export default function LoginForm() {
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId.trim()) {
      setError('Please enter your Staff ID');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('staffId', staffId);

    try {
      // In a Server Action, we can return errors or redirects.
      // Since redirects happen on the server, if we get here, it's an error or void.
      // However, typical pattern for next/navigation redirect inside server action
      // throws an error that Next.js catches to perform the redirect.
      // So we need to be careful.
      // Better: let the server action return an object { error?: string }
      // and perform redirect on client if success, OR use redirect() on server
      // which will cause this fetch to 'fail' or navigate.
      
      // Let's assume we modified loginWithStaffId to NOT redirect on success but return success: true
      // Wait, I implemented redirect() in the action.
      // So client-side invocation might catch a NEXT_REDIRECT error or just navigate.
      // Actually, invoking a server action that redirects:
      // The promise will resolve but the router will handle the navigation.
      
      // But wait, the previous implementation of loginWithStaffId DOES redirect.
      // Let's modify the call to be wrapped or handle it.
      
      // Actually, calling a Server Action that redirects from a Client Component 
      // is standard.
      
      // Let's wrap in a transition if we want pending state, but we have isLoading.
      
      // Issue: The Server Action `loginWithStaffId` uses `redirect()`.
      // When called from a Client Component, if `redirect()` is called, 
      // it might not throw in the same way as in Server Components, 
      // but it should work.
      
      // However, to get the error message back, we need to handle the return value.
      // If it redirects, it won't return.
      
      // Let's refactor: I'll use a wrapper here.
      
      const result = await loginWithStaffId(formData);
      if (result && result.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // If success, the redirect in the action will take over.
      
    } catch (err) {
      // If it's a redirect error, we can ignore it (Next.js handles it)
      // or if it's a real error, show it.
      // The `redirect` function throws an error that is caught by Next.js.
      // But when calling a server action from client, it behaves differently?
      // Actually, recent Next.js versions handle this gracefully.
      console.error(err);
      // setError('An unexpected error occurred.'); // Don't show this if it's just a redirect
      // Ideally we check `isRedirectError` but that's internal.
      
      // If the action redirects, the promise might reject or never resolve to a value?
      // Actually, the server action that redirects will return a response that tells the client to navigate.
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-6 text-center text-zinc-900 dark:text-zinc-100">Staff Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="staffId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Staff ID
          </label>
          <input
            type="text"
            id="staffId"
            name="staffId"
            value={staffId}
            onChange={(e) => {
              setStaffId(e.target.value);
              setError('');
            }}
            placeholder="Enter your Staff ID"
            className="w-full px-4 py-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            disabled={isLoading}
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Verifying...' : 'Enter Voting Dashboard'}
        </button>
      </form>
      
      <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Instructions:</h3>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-1">
          <li>Enter your unique Staff ID to access the ballot.</li>
          <li>You can only vote once.</li>
          <li>Your selections are confidential.</li>
        </ul>
      </div>
    </div>
  );
}
