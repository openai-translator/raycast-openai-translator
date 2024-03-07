import { getPreferenceValues } from "@raycast/api";
import { Provider } from "./base";

//XXX raycast doesn't support dynamic import
import openai from "./openai";
import raycast from "./raycast";
import azure from "./azure";
import gemini from "./gemini";
/* eslint-disable @typescript-eslint/no-explicit-any */

const PROVIDER_CLASSES: Record<string, new (...args: any[]) => Provider> = {
  openai,
  raycast,
  azure,
  gemini,
};

const record: Record<string, Provider> = {};
export function getProvider(provider: string): Provider {
  if (!(provider in record)) {
    const preferences = getPreferenceValues<{
      entrypoint: string;
      apikey: string;
      apiModel: string;
    }>();
    const providerClass = PROVIDER_CLASSES[provider];
    record[provider] = new providerClass(preferences);
  }
  return record[provider];
}
