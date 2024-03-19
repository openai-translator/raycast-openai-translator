import { Form, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";

import { IConfig, IModel } from "./providers/types";

import openaiConfig from  "./providers/openai/config" ;
import geminiConfig from  "./providers/gemini/config" ;
import { useProviders } from "./hooks/useProvider";
import { ProviderList } from "./views/provider-list";


export default function Command() {
  const providers  = useProviders();

  return (
    <ProviderList
      hook={providers} />
  )
}
