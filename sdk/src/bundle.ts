import 'reflect-metadata'
import fs from 'fs'
import { Model } from 'src'
import { ModuleConfig } from './module-config'

const outDir: string = 'dist'

function parseAttributes (CustomModel: typeof Model): object {
  const model = new CustomModel()
  const attributes: string[] = Reflect.getMetadata('attributes', model)
  const columns: any[] = []
  for (const attr of attributes) {
    const prop: any = Reflect.getMetadata('property', model, attr)
    prop.name = attr
    prop.defaultValue = (model as any)[attr]
    if (prop.type === 'relation') {
      const Foreign: typeof Model = Reflect.getMetadata('design:type', model, attr)
      const primaryKey: string = Reflect.getMetadata('primaryKey', new Foreign())
      prop.foreignTable = Foreign.getTableName()
      prop.foreignKey = primaryKey
    }
    columns.push(prop)
  }
  return columns
}

export function transformModuleConfig (config: ModuleConfig): void {
  if (config.models !== undefined) {
    config.models = config.models.map((CustomModel: typeof Model) => ({
      name: CustomModel.getTableName(),
      attributes: parseAttributes(CustomModel)
    }))
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  fs.writeFileSync(`${outDir}/module.config.json`, JSON.stringify(config))
}
