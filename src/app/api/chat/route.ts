import { streamText, UIMessage, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages }: { messages: Array<UIMessage> } = await req.json();

  const result = streamText({
    model: "moonshotai/kimi-k2.6",
    messages: await convertToModelMessages(messages)
  })

  return result.toUIMessageStreamResponse()
}
