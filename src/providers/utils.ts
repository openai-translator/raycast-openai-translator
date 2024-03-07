import { createParser, type ParsedEvent, type ReconnectInterval } from 'eventsource-parser';
import fetch, { RequestInit, BodyInit } from "node-fetch";
import { Readable,Transform, TransformCallback, TransformOptions } from 'stream';


export async function* fetchSSE(
  input: string,
  options: RequestInit
) {
  const {signal: originSignal, ...fetchOptions } = options;
  const timeout = 15 * 1000;
    const ctrl = new AbortController();
    const { signal } = ctrl;
    if (originSignal) {
      originSignal.addEventListener("abort", () => ctrl.abort());
    }
    const timerId = setTimeout(() => {
      ctrl.abort();
    }, timeout);
  try {

    const resp = await fetch(input, { ...fetchOptions, signal });
    console.debug(`resp.status:${resp.status}`)
    clearTimeout(timerId);

     if (resp.status !== 200) {
            const errorBody = await resp.json(); // Type the errorBody appropriately
            throw errorBody;
        }
    yield* Readable.from(resp.body).pipe(new EventTransform({ objectMode: true }));

  } catch (error) {
    console.debug(error)
    if (ctrl.signal.aborted) {
      throw new Error("Connection Timeout");
    } else {
      throw error;
    }
  }
}

class EventTransform extends Transform {
  private parser = createParser((event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          this.push(event);
        }
      })
  private decoder = new TextDecoder()
  constructor(options? : TransformOptions) {
    super(options);
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, next: TransformCallback) {
    this.parser.feed(this.decoder.decode(chunk as ArrayBuffer));
    next();
  }
}


/* eslint-disable @typescript-eslint/no-explicit-any */
export function getErrorText(err: any): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  if (typeof err === "object") {
    const { detail } = err;
    if (detail) {
      return detail;
    }
  }
  const { error } = err;
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object") {
    const { message } = error;
    if (message) {
      return message;
    }
  }
  return "Unexcept error";
}
