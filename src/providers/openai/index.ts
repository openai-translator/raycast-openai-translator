/* eslint-disable camelcase */

import { generatePrompt } from "../prompt";
import { TranslateQuery } from "../types";
import {
  fetchSSE,
} from "../utils";

export async function translate(
  query: TranslateQuery,
  entrypoint: string,
  apiKey: string,
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


  if (apiKey != "none") {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }


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

  await fetchSSE(`${entrypoint}`, options);

}
