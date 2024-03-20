import { Form, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { IConfig, IModel } from "../providers/types";

import openaiConfig from  "../providers/openai/config" ;
import geminiConfig from  "../providers/gemini/config" ;
import { Record, ProvidersHook } from "../hooks/useProvider";

export interface ProviderFormProps {
  record: Record | undefined;
  hook: ProvidersHook
  onCancel: () => void;
  onDone: () => void;
}

const providers: { value: string, title: string, config: IConfig}[] = [
  { value: "openai", title: "OpenAI", config: openaiConfig},
  { value: "gemini", title: "Gemini", config: geminiConfig},
  { value: "azure", title: "Azure",  config: openaiConfig},
  { value: "claude", title: "Claude",  config: openaiConfig},
  { value: "groq", title: "Groq",  config: openaiConfig},
  { value: "moonshot", title: "Moonshot",  config: openaiConfig},
  { value: "ollama", title: "Ollama", config: openaiConfig},
];

function providerByType(type: string): { value: string, title: string, config: IConfig} {
  return providers.find((p) => p.value === type)!;
}

function providerByConfig(config: IConfig): { value: string, title: string, config: IConfig} {
  return providers.find((p) => p.config === config)!;
}

function recordByName(name: string, hook: ProvidersHook): Record | undefined {
  return hook.data.find((r) => r.props.name === name);
}

function nextValidName(config: IConfig, hook: ProvidersHook): string {
  const provider = providerByConfig(config);
  const type =provider.value;
  const records = hook.data;
  const names = records.map((r) => r.props.name);
  let name = provider.title
  let i = 1;
  var existInGlobal = type == "openai"
  while (names.includes(name) || existInGlobal) {
    existInGlobal = false;
    name = `${provider.title} ${i}`;
    i++;
  }
  return name;
}

export const ProviderForm = (props: ProviderFormProps) => {
  const { record, hook, onCancel, onDone } = props;
  const providerProps = record?.props;
  const [config, setConfig] = useState(providers[
    record? providers.findIndex((p) => p.value === record.type) : 0
  ].config);

  const [models, setModels] = useState<IModel[]>([]);
  const [model, setModel] = useState<string | undefined >("");
  const [isModelLoading, setIsModelLoading] = useState(false);

  const customModel = { id: "custom", name: "Custom..." };

  const isCustomModel = model == customModel.id;
  const [customModelError, setCustomModelError] = useState<string | undefined>();

  const [apikey, setAPIKey] = useState(providerProps? providerProps.apikey : "");
  const [apiKeyError, setAPIKeyError] = useState<string | undefined>();

  const [name, setName] = useState<string>(record?.props?
    record.props.name
    : nextValidName(config, hook));
  const [nameError, setNameError] = useState<string | undefined>();


  useEffect(() => {
    console.log("config changed", apikey);
    setModel(providerProps? providerProps.apiModel :  config.defaultModel?.id);
    fetchModels();
  }, [config]);

  const fetchModels = async () => {
    try {
      setIsModelLoading(true);
      const models = await config.listModels(apikey);
      if(config.supportCustomModel){
        models.push(customModel);
      }
      setModels(models);
      setIsModelLoading(false);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };


  function handleModelChange(modelId: string){
    const selectedModel = models.find((m) => m.id === modelId);
    if(selectedModel){
      setModel(selectedModel.id);
    }
  }

  function handleCustomModelChange(value: string) {
    if (customModelError && customModelError.length > 0) {
      setCustomModelError(undefined);
    }
  }


  function handleAPIKeyChange(value: string) {
    setAPIKey(value);
    if (apiKeyError && apiKeyError.length > 0) {
      //reset error
      setAPIKeyError(undefined);
    }
  }

  function handleProviderChange(provider: string) {
    const selectedProvider = providers.find((p) => p.value === provider);
    if (selectedProvider) {
      setConfig(selectedProvider.config);
      setName(nextValidName(selectedProvider.config, hook))
    }
    if(apiKeyError && apiKeyError.length > 0) {
      if(apikey && apikey.length > 0 || !config.requireApiKey){
        setAPIKeyError(undefined);
      }
    }
  }


  function checkNameValid(name: string): boolean {
    if (name && name.length > 0) {
      if (record) {
        return true;
      }
      if (name === "OpenAI" || name === "Raycast" ||recordByName(name, hook)) {
        setNameError("Name already exists");
        return false;
      }
      setNameError(undefined);
      return true;
    }
    setNameError("Name is required");
    return false;
  }

  function submitForm(values: any) {
    // check api key
    if(config.requireApiKey && (!apikey || apikey.length == 0)){
      setAPIKeyError("API Key is required");
      return;
    }
    // check if custom model
    if(isCustomModel && (!values.customModel || values.customModel.length == 0)){
      setCustomModelError("Custom Model is required");
      return;
    }

    if(!checkNameValid(name)){
      return;
    }

    hook.addOrUpdate({
      id: record? record?.id : uuidv4(),
      type: providerByConfig(config).value,
      props: {
        name: name,
        apikey: apikey,
        entrypoint: values.entrypoint || config.defaultEntrypoint,
        apiModel: isCustomModel? values.customModel : values.model
      },
      created_at: new Date().toISOString(),
    })
    onDone();
  }



  return (
    <Form
      isLoading={isModelLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={providerProps? "Update" : "Create"}
            onSubmit={submitForm} />
          <Action title="Cancel" onAction={onCancel} />
          <Action title="Refresh Models" onAction={() => {
            fetchModels();
          }} />
        </ActionPanel>
      }>
      {!providerProps && (
        <Form.Dropdown
          id="provider"
          title="Provider"
          defaultValue="openai"
          onChange={handleProviderChange}>
          {providers.map((provider) => (
            <Form.Dropdown.Item key={provider.value} value={provider.value} title={provider.title}>
              {provider.title}
            </Form.Dropdown.Item>
          ))}
        </Form.Dropdown>)}
      {!providerProps && (
        <Form.TextField
          id="name"
          title="Name"
          value={name}
          error={nameError}
          onBlur={(event) => {
            const value = event.target.value;
            checkNameValid(value);
          }}
          onChange={(value) => {
              setName(value);
          }}
        />)}
      {config.supportCustomEntrypoint && (
        <Form.TextField
          id="entrypoint"
          title="Entrypoint"
          placeholder="Enter custom entrypoint"
          defaultValue={config.defaultEntrypoint}
        />
      )}
      <Form.PasswordField
        id="apikey"
        title="API Key"
        value={apikey}
        error={apiKeyError}
        onChange={handleAPIKeyChange}
        onBlur={(event) => {
          const value = event.target.value;
          if(!(value && value.length >0) && config.requireApiKey){
            setAPIKeyError("API Key is required");
          }
        }}
      />
      <Form.Dropdown
        id="model"
        title="Model"
        isLoading={isModelLoading}
        defaultValue={models.length ? model : ""}
        onChange={handleModelChange}>
        {models.map((model => (
          <Form.Dropdown.Item key={model.id} value={model.id} title={model.name} />
        )))}
      </Form.Dropdown>
      {isCustomModel && (
        <Form.TextField
          id="customModel"
          title="Custom Model"
          placeholder="Enter custom model"
          error={customModelError}
          onChange={handleCustomModelChange}
          onBlur={(event) => {
            const value = event.target.value;
            if(!(value && value.length >0)){
              setCustomModelError("Custom Model is required");
            }
          }}
        />
      )}
    </Form>
  );
}
