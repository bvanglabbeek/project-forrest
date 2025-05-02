'use client';

import { useSession, signOut } from 'next-auth/react';
import React from 'react';

const MODES = [
  { value: 'completions', label: 'Completions (Default Model)' },
  { value: 'assistant', label: 'Forrest (AI Assistant)' },
];

export default function Header({ mode, setMode }: { mode: string; setMode: (m: string) => void }) {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between py-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-black">AI Chat Assistant</h1>
      <div className="flex-1 flex justify-center">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="p-2 border rounded-lg text-gray-900"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Signed in as <span className="font-bold">{session?.user?.name}</span>
          {session?.user && (session.user as any).username && (
            <> (<span className="font-bold">{(session.user as any).username}</span>)</>
          )}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 