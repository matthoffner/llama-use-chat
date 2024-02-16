export class LlamaStreamError extends Error {
  type: string
  param: string
  code: string

  constructor(message: string, type: string, param: string, code: string) {
    super(message)
    this.name = 'LlamaStreamError'
    this.type = type
    this.param = param
    this.code = code
  }
}

export const LlamaStream = async (
  url: string,
  systemPrompt: string,
  messages: any[],
  stream = true,
  n_predict = 400,
  temperature = 0.7,
  stop = ['</s>', 'Llama:', 'User:'],
  repeat_last_n = 256,
  repeat_penalty = 1.18,
  top_k = 40,
  top_p = 0.95,
  min_p = 0.05,
  tfs_z = 1,
  typical_p = 1,
  presence_penalty = 0,
  frequency_penalty = 0,
  mirostat = 0,
  mirostat_tau = 5,
  mirostat_eta = 0.1,
  grammar = '',
  n_probs = 0,
  image_data = [],
  cache_prompt = true,
  api_key = '',
  slot_id = -1
) => {
  const formattedMessages = messages
    .map(
      (message) =>
        `${message.role === 'system' ? 'System:' : message.role === 'user' ? 'User:' : 'Assistant:'} ${message.content}`
    )
    .join('\n')

  const res = await fetch(url, {
    body: JSON.stringify({
      stream,
      n_predict,
      temperature,
      stop,
      repeat_last_n,
      repeat_penalty,
      top_k,
      top_p,
      min_p,
      tfs_z,
      typical_p,
      presence_penalty,
      frequency_penalty,
      mirostat,
      mirostat_tau,
      mirostat_eta,
      grammar,
      n_probs,
      image_data,
      cache_prompt,
      api_key,
      slot_id,
      prompt: `${systemPrompt}\n\n${formattedMessages}`,
    }),
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const encoder = new TextEncoder()
  const decoder = new TextDecoder('utf-8')

  if (res.status !== 200) {
    // Handle error response
    const errorText = await res.text()
    throw new Error(`Fetch error: ${errorText}`)
  }

  if (res.status !== 200 || !res.body) {
    // Instead of throwing an error or returning null, return an empty stream
    console.error('Fetch error or response body is null')
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.close() // Immediately close the stream
      },
    })
  }

  const reader = res.body.getReader()

  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Decode the chunk to text
          const chunkText = decoder.decode(value, { stream: true })
          const lines = chunkText.split('\n')

          lines.forEach((line) => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(5)) // Extract JSON part
                if (data.content) {
                  const text = data.content
                  controller.enqueue(encoder.encode(text))
                }
              } catch (e) {
                console.error('Error parsing JSON from line:', line, e)
                // Optionally handle the error, e.g., by logging or stopping the stream
              }
            }
          })
        }
      } catch (err) {
        console.error('Stream reading failed:', err)
        controller.error(err)
      }

      controller.close()
    },
  })

  return responseStream
}
