'use client';

import React, { useState } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';

export default function Home() {
  const [mode, setMode] = useState('completions');
  const [key, setKey] = useState(0); // for resetting chat

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    setKey((k) => k + 1); // force ChatInterface to remount and clear chat
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
