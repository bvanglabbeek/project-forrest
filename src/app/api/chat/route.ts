import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_CONFIG } from '@/config/ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handlePost(request: Request) {
  const { messages, mode } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: 'Messages are required and must be an array' },
      { status: 400 }
    );
  }

  let response;
  if (mode === 'assistant') {
    // Call the OpenAI Assistants API
    // 1. Create a thread
    const thread = await openai.beta.threads.create();
    // 2. Add messages to the thread
    for (const msg of messages) {
      await openai.beta.threads.messages.create(thread.id, {
        role: msg.role,
        content: msg.content,
      });
    }
    // 3. Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: AI_CONFIG.assistant.id,
    });
    // 4. Poll for completion
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (runStatus.status === 'completed') break;
      await new Promise((res) => setTimeout(res, 1000));
    } while (runStatus.status === 'queued' || runStatus.status === 'in_progress');
    // 5. Get the latest assistant message
    const threadMessages = await openai.beta.threads.messages.list(thread.id);
    const assistantMsg = threadMessages.data.find((m) => m.role === 'assistant');
    let textContent = '';
    if (assistantMsg && Array.isArray(assistantMsg.content)) {
      const textBlock = assistantMsg.content.find((c) => c.type === 'text');
      textContent = textBlock?.text?.value || 'No text response from assistant.';
    } else {
      textContent = 'No assistant message found.';
    }
    response = {
      role: 'assistant',
      content: textContent,
    };
  } else {
    // Default: Call the Completions API
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.completionModel,
      messages: messages,
      temperature: 0.7,
    });
    response = completion.choices[0].message;
  }

  return NextResponse.json({ response });
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    let errorDetails = {};
    if (error instanceof Error) {
      errorDetails = { message: error.message, stack: error.stack };
    } else {
      errorDetails = { error: JSON.stringify(error) };
    }
    console.error('Error in chat API:', errorDetails);
    return NextResponse.json(
      { error: 'Failed to process chat request', ...errorDetails },
      { status: 500 }
    );
  }
} 