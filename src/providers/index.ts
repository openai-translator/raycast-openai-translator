import { TranslateQuery } from "./types";

import * as openai from "./openai";
import * as raycast from "./raycast";
import * as azure from "./azure";
import * as palm2 from "./palm2";


export async function translate(
  query: TranslateQuery,
  entrypoint: string,
  apiKey: string,
  model: string,
  provider: string
) {
  switch (provider) {
  case "openai":
    openai.translate(query,entrypoint,apiKey,model)
    break;
   case "raycast":
     raycast.translate(query,model)
     break;
  case "azure":
    azure.translate(query,entrypoint,apiKey)
    break;
  case "palm2":
    palm2.translate(query, apiKey)
    break;
  }
}
