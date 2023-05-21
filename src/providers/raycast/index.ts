import { AI, environment } from "@raycast/api";
import { generatePrompt } from "../prompt";
import { TranslateQuery } from "../types";
import { FetchSSEOptions } from "../utils";

async function raycast(options: FetchSSEOptions) {
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
      model: "gpt-3.5-turbo",
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


export async function translate(
  query: TranslateQuery,
  model: string,
) {
  const {
    rolePrompt,
    assistantPrompts,
    commandPrompt,
    contentPrompt,
    isWordMode,
    quoteProcessor
  } = generatePrompt(query)

  let body: Record<string, any> = {
    model,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
    stream: true,
  };

  const isFirst = true;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const messages = [
    {
      role: "system",
      content: rolePrompt,
    },
    ...assistantPrompts.map((prompt) => {
      return {
        role: "user",
        content: prompt,
      };
    }),
    {
      role: "user",
      content: commandPrompt,
    },
    {
      role: "user",
      content: contentPrompt,
    },
  ];
  body["messages"] = messages;




  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: query.signal,
    agent: query.agent,
    onMessage: (msg) => {
      let resp;
      try {
        resp = JSON.parse(msg);
        // eslint-disable-next-line no-empty
      } catch (error) {
        query.onFinish("stop");
        return;
      }

      const { choices } = resp;
      if (!choices || choices.length === 0) {
        return { error: "No result" };
      }
      const { finish_reason: finishReason } = choices[0];
      if (finishReason) {
        query.onFinish(finishReason);
        return;
      }

      let targetTxt = "";
      const { content = "", role } = choices[0].delta;

      targetTxt = content;

      if (quoteProcessor) {
        targetTxt = quoteProcessor.processText(targetTxt);
      }

      query.onMessage({ content: targetTxt, role, isWordMode });

    },
    onError: (err) => {
      if (err instanceof Error) {
        query.onError(err.message);
        return;
      }
      if (typeof err === "string") {
        query.onError(err);
        return;
      }
      if (typeof err === "object") {
        const { detail } = err;
        if (detail) {
          query.onError(detail);
          return;
        }
      }
      const { error } = err;
      if (error instanceof Error) {
        query.onError(error.message);
        return;
      }
      if (typeof error === "object") {
        const { message } = error;
        if (message) {
          query.onError(message);
          return;
        }
      }
    },
  };

  await raycast(options);

}
