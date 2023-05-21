import { v1beta2 as generativeLanguage } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";
import { generatePrompt } from "../prompt";
import { TranslateQuery } from "../types";

const { TextServiceClient } = generativeLanguage;

const MODEL_NAME = "models/text-bison-001";



export async function translate(
  query: TranslateQuery,
  apiKey: string
) {
  const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(apiKey),
  });

  const {
    rolePrompt,
    assistantPrompts,
    commandPrompt,
    contentPrompt,
    isWordMode,
    quoteProcessor
  } = generatePrompt(query)

  const text = `System: ${rolePrompt}\n${assistantPrompts.map((prompt) => "User: "+prompt).join("\n")}${ commandPrompt ? "User: " + commandPrompt +"\n" : ""}User: ${contentPrompt}\n`
  console.log(text)
  try {
    const result = await client.generateText({
      model: MODEL_NAME,
      prompt: {
        text,
      },
    })
    let targetTxt = "";
    const content = result[0].candidates[0].output
    targetTxt = content;
    if (quoteProcessor) {
      targetTxt = quoteProcessor.processText(targetTxt);
    }
    query.onMessage({ content: targetTxt, role: "", isWordMode });

    query.onFinish("stop");
  } catch (error) {
    query.onError(error.message);
    return;
  }
}
