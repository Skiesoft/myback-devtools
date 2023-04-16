import 'reflect-metadata'
import Database from 'better-sqlite3'
import AppRoot from 'app-root-path'
import { AttributeProperty } from '../api/decorator'
import { Model } from '..'
import { Configable, ModuleConfig } from '../module-config'

export function createSQLiteDatabase (config: ModuleConfig): void {
  if (config.models === undefined) {
    throw new Error('No model in config file, can not create test database.')
  }

  const db = new Database(`${AppRoot as unknown as string}/data/default.db`)
  for (const CustomModel of config.models) {
    const model = new CustomModel()
    const attributes: string[] = Reflect.getMetadata('attributes', model)

    const columns: string[] = []
    const constraints: string[] = []
    for (const attr of attributes) {
      const prop: AttributeProperty = Reflect.getMetadata('property', model, attr)
      let defaultValue: any = (model)[attr]
      let type: string = prop.type

      switch (type) {
        case 'boolean':
          type = 'INTEGER'
          if (defaultValue !== undefined) {
            defaultValue = Boolean(defaultValue)
          }
          break
        case 'relation':
        case 'int':
          type = 'INTEGER'
          break
        case 'float':
          type = 'REAL'
          break
        case 'datetime':
        case 'date':
          type = type.toUpperCase() // DATE and DATETIME
          if (defaultValue !== undefined) {
            defaultValue = `'${(defaultValue as Date).toISOString()}'`
          }
          break
        case 'string':
          type = 'TEXT'
          if (defaultValue != null) {
            defaultValue = `'${defaultValue as string}'`
          }
          break
      }

      let col = `${attr} ${type} `
      if (prop.primary === true) col += 'PRIMARY KEY '
      if (prop.unique === true) col += 'UNIQUE '
      if (prop.autoIndex === true) col += 'AUTOINCREMENT '
      if (prop.nullable !== true) col += 'NOT NULL '
      if (defaultValue !== undefined) col += `DEFAULT ${defaultValue as string}`
      columns.push(col)
      if (prop.type === 'relation') {
        const Foreign: typeof Model = Reflect.getMetadata('design:type', model, attr)
        const primaryKey: string = Reflect.getMetadata('primaryKey', new Foreign())
        constraints.push(`FOREIGN KEY(${attr}) REFERENCES ${Foreign.getTableName()}(${primaryKey})`)
      }
    }
    const stmts = columns.concat(constraints)
    db.exec(`CREATE TABLE IF NOT EXISTS ${CustomModel.getTableName() as string} (${stmts.join(', ')})`)
  }
}

export function getDefaultConfigs (configs: Configable[]): Record<string, any> {
  const res: Record<string, any> = {}
  for (const conf of configs) {
    res[conf.key] = conf.default
  }
  return res
}
