import { auth } from '@/lib/auth';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { headers } from 'next/headers';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages }: { messages: Array<UIMessage> } = await req.json();

  const result = streamText({
    model: openrouter('moonshotai/kimi-k2.6'),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
