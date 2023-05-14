import { AI, environment } from "@raycast/api";
import { createParser } from "eventsource-parser";
import fetch, { RequestInit } from "node-fetch";

interface FetchSSEOptions extends RequestInit {
  onMessage(data: string): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError(error: any): void;
}

export async function fetchSSE(input: string, options: FetchSSEOptions) {
  const proxy = "socks5://localhost:1080";

  const { onMessage, onError, signal: originSignal, ...fetchOptions } = options;
  const timeout = 15 * 1000;
  let abortByTimeout = false;
  try {
    const ctrl = new AbortController();
    const { signal } = ctrl;
    if (originSignal) {
      originSignal.addEventListener("abort", () => ctrl.abort());
    }
    const timerId = setTimeout(() => {
      abortByTimeout = true;
      ctrl.abort();
    }, timeout);

    const resp = await fetch(input, { ...fetchOptions, signal });

    clearTimeout(timerId);

    if (resp.status !== 200) {
      onError(await resp.json());
      return;
    }
    const parser = createParser((event) => {
      if (event.type === "event") {
        onMessage(event.data);
      }
    });
    if (resp.body) {
      for await (const chunk of resp.body) {
        if (chunk) {
          const str = new TextDecoder().decode(chunk as ArrayBuffer);
          parser.feed(str);
        }
      }
    }
  } catch (error) {
    if (abortByTimeout) {
      onError({ error: { message: "Connection Timeout" } });
    } else {
      onError({ error });
    }
  }
}

export async function raycast(options: FetchSSEOptions) {
  const { onMessage, onError, signal: originSignal, body } = options;
  const timeout = 15 * 1000;
  let abortByTimeout = false;
  try {
    if (!environment.canAccess(AI)) {
      throw new Error("You do not have access to RaycastAI.");
    }
    const ctrl = new AbortController();
    const { signal } = ctrl;
    if (originSignal) {
      originSignal.addEventListener("abort", () => ctrl.abort());
    }
    const timerId = setTimeout(() => {
      abortByTimeout = true;
      ctrl.abort();
    }, timeout);

    const prompt = JSON.parse(body)
      .messages.map((item: { role: string; content: string }) => item.content)
      .join("\n");

    const resp = await AI.ask(prompt, {
      creativity: "low",
      signal,
    });

    clearTimeout(timerId);

    const msgCreator = (finishReason: string | null) =>
      JSON.stringify({
        choices: [
          {
            delta: {
              content: resp.replaceAll("\n", "\n\n"),
            },
            index: 0,
            finish_reason: finishReason,
          },
        ],
      });

    onMessage(msgCreator(null));
    setTimeout(() => {
      onMessage(msgCreator("stop"));
    }, 10);
  } catch (error) {
    if (abortByTimeout) {
      onError({ error: { message: "Connection Timeout" } });
    } else {
      onError({ error });
    }
  }
}
