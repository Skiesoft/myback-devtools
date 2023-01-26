import 'reflect-metadata'
import Database from 'better-sqlite3'
import AppRoot from 'app-root-path'
import inquirer from 'inquirer'
import App from './index'
import { AttributeProperty } from 'src/api/decorator'
import { Model } from 'src'

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
  inquirer.prompt([
    {
      name: 'entry',
      type: 'list',
      choices: ['Launch fake API', 'Create test database']
    }
  ]).then(async (answers) => {
    const config: ConfigType = (await require(`${AppRoot as unknown as string}/module.config`) as unknown) as ConfigType
    if (config === undefined) {
      throw new Error('Module config undefined.')
    }

    switch (answers.entry) {
      case 'Launch fake API':
        await launchFakeAPI()
        break
      case 'Create test database':
        await createSQLiteDatabase(config)
        break
    }
  }).catch((err) => {
    throw err
  })
}
