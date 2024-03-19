import { IConfig, IModel } from '../types';

const config: IConfig = {
  requireModel: true,
  defaultModel: {
    id: "gemini-pro",
    name: "gemini-pro",
  },
  supportCustomModel: false,
  async listModels(apikey: string | undefined): Promise<IModel[]> {
    return Promise.resolve([
      { name: 'gemini-pro', id: 'gemini-pro' },
      { name: 'gemini-1.0-pro', id: 'gemini-1.0-pro' },
      { name: 'gemini-1.0-pro-001', id: 'gemini-1.0-pro-001' },
      { name: 'gemini-1.0-pro-latest', id: 'gemini-1.0-pro-latest' },
      { name: 'gemini-1.0-pro-vision-latest', id: 'gemini-1.0-pro-vision-latest' },
    ])
  },
  defaultEntrypoint: "https://generativelanguage.googleapis.com/v1beta/models",
  supportCustomEntrypoint: false,
  requireApiKey: true,
}

export default config;
