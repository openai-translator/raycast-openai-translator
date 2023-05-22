import { TextServiceClient, v1beta2 as generativeLanguage } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";
import { Provider } from "..";
import { Prompt } from "../prompt";
import { TranslateQuery } from "../types";
import { getErrorText } from "../utils";


const MODEL_NAME = "models/text-bison-001";

export default class extends Provider{
  private client: TextServiceClient;

  constructor({apiKey}: {apiKey: string}) {
    super()
    this.client = new generativeLanguage.TextServiceClient({
      authClient: new GoogleAuth().fromAPIKey(apiKey),
    });
  }

  async doTranslate(query: TranslateQuery, prompt: Prompt): Promise<void>{
    const {
      rolePrompt,
      assistantPrompts,
      commandPrompt,
      contentPrompt,
      quoteProcessor,
      meta
    } = prompt

    const { isWordMode } = meta

    const text = `System: ${rolePrompt}\n${assistantPrompts.map((prompt) => "User: "+prompt).join("\n")}${ commandPrompt ? "User: " + commandPrompt +"\n" : ""}User: ${contentPrompt}\n`


    console.log(text)
    let abort = false //did we need lock?
    try {
      query.signal.addEventListener("abort", ()=>{
        if(!abort){
          abort = true;
          query.onError("Abort");
        }
      })

      //FIXME google-gax didn't support AbortController try nice-grpc
      const [resp, _] = await this.client.generateText({
        model: MODEL_NAME,
        stopSequences: quoteProcessor ? [quoteProcessor.quoteEnd] : null,
        temperature: 0,
        prompt: {
          text,
        },
      })

      if(resp.candidates && resp.candidates.length > 0){
        const content = resp.candidates[0].output
        let targetTxt = content ?? "";
        if (quoteProcessor) {
          targetTxt = quoteProcessor.processText(targetTxt);
        }
        if(!abort){
          query.onMessage({ content: targetTxt, role: "", isWordMode });
          query.onFinish("stop");
        }
      } else {
        if(resp.filters && resp.filters.length > 0){
          query.onError(`filters: ${resp.filters.map(f => f.reason).join(", ")}`);
        }else{
          query.onError("Unexcept error");
        }
      }
    } catch (error) {
      if(!abort){
        query.onError(getErrorText(error))
      }
    }

  }
}
