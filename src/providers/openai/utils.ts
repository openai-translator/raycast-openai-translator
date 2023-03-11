import { createParser } from 'eventsource-parser'
import fetch, { RequestInit } from 'node-fetch'
import { isReadable, Readable } from 'stream'



interface FetchSSEOptions extends RequestInit {
  onMessage(data: string): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError(error: any): void
}

export async function fetchSSE(input: string, options: FetchSSEOptions) {
  const { onMessage, onError, ...fetchOptions } = options
  const resp = await fetch(input, fetchOptions)
  if (resp.status !== 200) {
    onError(await resp.json())
    return
  }
  const parser = createParser((event) => {
    if (event.type === 'event') {
      onMessage(event.data)
    }
  })
  if(resp.body){
    for await (const chunk of resp.body) {
      const str = new TextDecoder().decode(chunk)
      parser.feed(str)
    }
  }
}
