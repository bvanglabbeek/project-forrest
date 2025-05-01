import ChatInterface from './components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center py-6">AI Chat Assistant</h1>
        <ChatInterface />
      </div>
    </main>
  );
}
