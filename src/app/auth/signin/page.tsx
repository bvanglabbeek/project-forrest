'use client';
export const dynamic = "force-dynamic";

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Component that uses useSearchParams
function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  let errorMessage = '';
  if (error) {
    if (error === 'AccessDenied') {
      errorMessage = 'You do not have access to this resource.';
    } else if (error === 'OAuthAccountNotLinked') {
      errorMessage = 'Please sign in with the same provider you originally used.';
    } else {
      errorMessage = `Sign-in error: ${error}`;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {errorMessage && (
            <p className="mt-2 text-center text-sm text-red-600 font-bold">
              {errorMessage}
            </p>
          )}
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => signIn('github', { callbackUrl })}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component that uses Suspense
export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}