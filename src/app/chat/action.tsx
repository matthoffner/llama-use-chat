'use server'

import { experimental_StreamingReactResponse, Message } from 'ai'
import { LlamaStream } from './llama'

const LLAMA_SERVER_URL = process.env.LLAMA_SERVER_URL

export async function handler({ messages }: { messages: Message[] }) {
  const systemPrompt = 'You are a helpful assistant'
  // Convert the response into a friendly text-stream
  const stream = await LlamaStream(
    LLAMA_SERVER_URL || 'http://127.0.0.1:8080/completion',
    systemPrompt,
    messages
  )

  // Respond with the stream
  return new experimental_StreamingReactResponse(stream, {
    ui({ content }) {
      return <div className="text-red-800">{content}</div>
    },
  })
}
