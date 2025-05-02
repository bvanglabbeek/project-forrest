'use client';

import React, { useState } from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';

export default function ChatPageClient() {
  const [mode, setMode] = useState('completions');
  const [key, setKey] = useState(0);

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    setKey((k) => k + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Header mode={mode} setMode={handleModeChange} />
        <ChatInterface key={key} mode={mode} />
      </div>
    </main>
  );
} 