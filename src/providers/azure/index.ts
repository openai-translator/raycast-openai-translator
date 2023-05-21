import { generatePrompt } from "../prompt";
import { TranslateQuery } from "../types";
import { fetchSSE } from "../utils";

export async function translate(
  query: TranslateQuery,
  entrypoint: string,
  apiKey: string,
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
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
    stream: true,
  };

  let isChatAPI = true;
  if (entrypoint.indexOf("/chat/completions") < 0) {
    // Azure OpenAI Service supports multiple API.
    // We should check if the settings.apiURLPath is match `/deployments/{deployment-id}/chat/completions`.
    // If not, we should use the legacy parameters.
    isChatAPI = false;
    body[
      "prompt"
    ] = `<|im_start|>system\n${rolePrompt}\n<|im_end|>\n<|im_start|>user\n${commandPrompt}\n${contentPrompt}\n<|im_end|>\n<|im_start|>assistant\n`;
    body["stop"] = ["<|im_end|>"];
  }
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

  headers["api-key"] = `${apiKey}`;

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
      if (!isChatAPI) {
        // It's used for Azure OpenAI Service's legacy parameters.
        targetTxt = choices[0].text;
        if (quoteProcessor) {
          targetTxt = quoteProcessor.processText(targetTxt);
        }

        query.onMessage({ content: targetTxt, role: "", isWordMode });
      } else {
        const { content = "", role } = choices[0].delta;

        targetTxt = content;

        if (quoteProcessor) {
          targetTxt = quoteProcessor.processText(targetTxt);
        }

        query.onMessage({ content: targetTxt, role, isWordMode });
      }
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
