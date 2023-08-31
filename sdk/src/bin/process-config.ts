import 'reflect-metadata'
import { Configable, ModuleConfig } from '../module-config'
import { exportModuleConfig } from '../bundle'
import { HTTP_METHOD, SDK } from '../sdk'
import dotenv from 'dotenv'

export async function updateRemoteSchema (config: ModuleConfig): Promise<void> {
  if (config.models === undefined) {
    throw new Error('No model in config file, no schema to update.')
  }
  const expr = exportModuleConfig(config)

  dotenv.config()
  SDK.init({
    API_TOKEN: process.env.API_TOKEN!,
    DATABASE: process.env.DATABASE_ID,
    STORAGE: process.env.STORAGE_ID
  })

  // Destory previous schema.
  await SDK.request(HTTP_METHOD.DELETE, `admin/schema/${SDK.config.DATABASE!}`)

  // Install new schema.

  await SDK.request(HTTP_METHOD.POST, `admin/schema/${SDK.config.DATABASE!}/install`, {
    schema: JSON.stringify(expr.models)
  })
}

export function getDefaultConfigs (configs: Configable[]): Record<string, any> {
  const res: Record<string, any> = {}
  for (const conf of configs) {
    res[conf.key] = conf.default
  }
  return res
}
