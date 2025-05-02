'use client';

import React, { useState } from 'react';

export default function DebugPanel({ error }: { error: any }) {
  const [open, setOpen] = useState(false);

  if (process.env.NODE_ENV === 'production' || !error) return null;

  const errorString = typeof error === 'string' ? error : JSON.stringify(error, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(errorString);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1 bg-gray-800 text-white rounded shadow hover:bg-gray-700"
      >
        {open ? 'Hide Debug Panel' : 'Show Debug Panel'}
      </button>
      {open && (
        <div className="mt-2 p-4 bg-white border border-gray-300 rounded shadow-lg max-w-md max-h-96 overflow-auto">
          <div className="mb-2 font-bold text-red-600">Last Error</div>
          <pre className="text-xs whitespace-pre-wrap break-all mb-2">{errorString}</pre>
          <button
            onClick={handleCopy}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
          >
            Copy Error
          </button>
        </div>
      )}
    </div>
  );
} 