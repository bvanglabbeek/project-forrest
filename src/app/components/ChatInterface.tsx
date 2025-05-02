'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef, useEffect } from 'react';
import DebugPanel from './DebugPanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function renderWithCitations(content: string) {
  // Replace citations like 【4:1†source】 with a styled <sup> element
  return content.replace(/【(\d+:\d+[^】]*)】/g, (_, p1) => {
    return `<sup class='citation-badge'>[${p1}]</sup>`;
  });
}

export default function ChatInterface({ mode }: { mode: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode,
        }),
      });

      let data: any = null;
      let errorData: any = null;
      if (!response.ok) {
        try {
          errorData = await response.json();
        } catch (jsonErr) {
          errorData = {
            status: response.status,
            statusText: response.statusText,
            message: 'Failed to parse error JSON',
            raw: await response.text(),
          };
        }
        setLastError(errorData);
        throw new Error('Failed to get response');
      }

      try {
        data = await response.json();
      } catch (jsonErr) {
        setLastError({
          status: response.status,
          statusText: response.statusText,
          message: 'Failed to parse response JSON',
          raw: await response.text(),
        });
        throw new Error('Failed to parse response JSON');
      }
      setMessages((prev) => [...prev, (data as any).response]);
      setLastError(null);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
      setLastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat management actions
  const handleSaveChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyChat = () => {
    const chatText = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
    navigator.clipboard.writeText(chatText);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex justify-end">
        {/* Remove the select element as mode is now a prop */}
      </div>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-0">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="assistant-message">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Render HTML for citations
                      p: ({ node, children, ...props }) => {
                        let text = '';
                        if (Array.isArray(children)) {
                          text = children.join('');
                        } else if (typeof children === 'string') {
                          text = children;
                        }
                        return <p {...props} dangerouslySetInnerHTML={{ __html: renderWithCitations(text) }} />;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Chat Management Buttons */}
      <div className="flex gap-2 mb-4 justify-end">
        <button
          onClick={handleSaveChat}
          disabled={messages.length === 0}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors duration-150
            ${messages.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-900'}`}
        >
          Save Chat
        </button>
        <button
          onClick={handleCopyChat}
          disabled={messages.length === 0}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors duration-150
            ${messages.length === 0 ? 'bg-blue-100 text-blue-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-800'}`}
        >
          Copy Chat
        </button>
        <button
          onClick={handleClearChat}
          disabled={messages.length === 0}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors duration-150
            ${messages.length === 0 ? 'bg-red-100 text-red-300 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-700'}`}
        >
          Clear Chat
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
      <DebugPanel error={lastError} />
    </div>
  );
} 