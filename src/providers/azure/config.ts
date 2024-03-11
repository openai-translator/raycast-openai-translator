import { IConfig, IModel } from '../types';

const config: IConfig = {
  requireModel: false,
  supportCustomModel: false,
  defaultModel: undefined,
  async listModels(apikey: string | undefined): Promise<IModel[]> {
    return Promise.resolve([])
  },
  defaultEntrypoint: "",
  supportCustomEntrypoint: true,
  requireApiKey: true,
}

export default config;
