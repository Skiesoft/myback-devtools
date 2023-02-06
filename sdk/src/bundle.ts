import 'reflect-metadata'
import { PluginOption } from 'vite'
import fs from 'fs'
import { Model } from 'src'
import { ConfigType } from './test-server/cli'

export default function bundleModule (ModuleConfig: ConfigType, outDir: string = 'dist/assets'): PluginOption {
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

  function transformModuleConfig (ModuleConfig: ConfigType): void {
    if (ModuleConfig.models !== undefined) {
      ModuleConfig.models = ModuleConfig.models.map((CustomModel: typeof Model) => parseModel(CustomModel))
    }
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true })
    }
    fs.writeFileSync(`${outDir}/module.config.json`, JSON.stringify(ModuleConfig))
  }

  return {
    name: 'myback-module-bundler',
    apply: 'build',
    closeBundle () {
      try {
        console.log('Compiling module.config.ts')
        transformModuleConfig(ModuleConfig)
      } catch (err) {
        console.error(err)
      }
    }
  }
}