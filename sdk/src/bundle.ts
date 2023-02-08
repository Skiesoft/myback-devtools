import 'reflect-metadata'
import fs from 'fs'
import { Model } from 'src'
import { ConfigType } from './test-server/cli'
import appRootPath from 'app-root-path'

const outDir: string = 'dist'

function parseModel (CustomModel: typeof Model): object {
  const model = new CustomModel()
  const attributes: string[] = Reflect.getMetadata('attributes', model)
  const column: any[] = []
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
    column.push(prop)
  }
  return column
}

export function transformModuleConfig (ModuleConfig: ConfigType): void {
  if (ModuleConfig.models !== undefined) {
    ModuleConfig.models = ModuleConfig.models.map((CustomModel: typeof Model) => parseModel(CustomModel))
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  fs.writeFileSync(`${outDir}/module.config.json`, JSON.stringify(ModuleConfig))
}

if (require.main === module) {
  console.log('Compiling module.config.ts')
  transformModuleConfig(require(`${appRootPath as unknown as string}/module.config.ts`))
}
