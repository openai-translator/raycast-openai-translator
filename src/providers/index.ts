import { TranslateQuery } from "./types";
import { Prompt, promptBuilders, generatMetadata } from "./prompt";
import { getPreferenceValues } from "@raycast/api";

export abstract class Provider {
  protected generatePrompt(query: TranslateQuery): Prompt{
    const meta = generatMetadata(query)
    const prompt  = {
      rolePrompt: "You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.",
      commandPrompt: `Translate from ${meta.sourceLang} to ${meta.targetLang}. Only the translated text can be returned.`,
      contentPrompt : query.text,
      assistantPrompts: [],
      quoteProcessor: undefined,
      meta
    }
    return promptBuilders[query.mode](prompt)
  }
  protected abstract doTranslate(query: TranslateQuery, prompt: Prompt): Promise<void>

  async translate(query: TranslateQuery) {
    this.doTranslate(query, this.generatePrompt(query))
  }
}

const record: Record<string, Provider> = {}
export function getProvider(provider: string): Provider {
  if (!(provider in record)) {
    const preferences = getPreferenceValues<{
    entrypoint: string;
    apikey: string;
    apiModel: string;
    }>()
    const providerClass = require(`./${provider}`)
    record[provider] = new providerClass(preferences);
  }
  return record[provider];
}
