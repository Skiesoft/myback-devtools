#!/usr/bin/env node
import 'reflect-metadata'
import Database from 'better-sqlite3'
import AppRoot from 'app-root-path'
import { program } from 'commander'
import App from './index'
import { AttributeProperty } from '../api/decorator'
import { Model } from '..'

export interface ConfigType {
  name: string
  description?: string
  models?: any[]
}

export async function createSQLiteDatabase (config: ConfigType): Promise<void> {
  if (config.models === undefined) {
    throw new Error('No model in config file, can not create test database.')
  }

  const db = new Database(`${AppRoot as unknown as string}/data/default.db`)
  for (const CustomModel of config.models) {
    const model = new CustomModel()
    const attributes: string[] = Reflect.getMetadata('attributes', model)

    const columns: string[] = []
    for (const attr of attributes) {
      const prop: AttributeProperty = Reflect.getMetadata('property', model, attr)
      let type: string = prop.type
      switch (type) {
        case 'relation':
        case 'boolean':
        case 'int':
          type = 'INTEGER'
          break
        case 'float':
          type = 'REAL'
          break
        case 'string':
          type = 'TEXT'
          break
      }

      let col = `${attr} ${type} `
      if (prop.primary === true) col += 'PRIMARY KEY '
      if (prop.unique === true) col += 'UNIQUE '
      if (prop.autoIndex === true) col += 'AUTOINCREMENT '
      if (prop.nullable !== true) col += 'NOT NULL '
      const defaultValue = (model)[attr]
      if (defaultValue !== undefined) col += `DEFAULT ${type === 'TEXT' ? `'${defaultValue as string}'` : defaultValue as number} `
      columns.push(col)
      if (prop.type === 'relation') {
        const Foreign: typeof Model = Reflect.getMetadata('design:type', model, attr)
        const primaryKey: string = Reflect.getMetadata('primaryKey', new Foreign())
        columns.push(`FOREIGN KEY(${attr}) REFERENCES ${Foreign.getTableName()}(${primaryKey})`)
      }
    }
    db.exec(`CREATE TABLE IF NOT EXISTS ${CustomModel.getTableName() as string} (${columns.join(', ')})`)
  }
}

export async function launchFakeAPI (): Promise<any> {
  const { server } = await App.start()
  return server
}

if (require.main === module) {
  async function main (): Promise<void> {
    program
      .option('--launch', 'launch fake API')
      .option('--create-db', 'create test database')

    program.parse()

    const options = program.opts()
    if (options.createDb === true) {
      const config: ConfigType = (await require(`${AppRoot as unknown as string}/module.config`) as unknown) as ConfigType
      if (config === undefined) {
        throw new Error('Module config undefined.')
      }
      await createSQLiteDatabase(config)
    }
    if (options.launch === true) {
      await launchFakeAPI()
    }
  }
  main().catch((err) => { console.error(err) })
}
