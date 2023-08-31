#!/usr/bin/env ts-node-script

import AppRoot from 'app-root-path'
import minimist from 'minimist'
import { getDefaultConfigs, updateRemoteSchema } from './process-config'
import { writeModuleConfig } from '../bundle'
import { ModuleConfig } from '../module-config'
import childProcess from 'child_process'
import fse from 'fs-extra'
import path from 'path'
import dotenv from 'dotenv'

async function main (): Promise<void> {
  const rawArgv = process.argv.slice(2)
  const args = minimist(rawArgv, {
    boolean: [
      'createDB',
      'noVue'
    ]
  })

  const config: ModuleConfig = (require(`${AppRoot as unknown as string}/module.config`) as unknown) as ModuleConfig

  if (args._[0] === 'serve') {
    if (args.createDB === true) {
      if (config === undefined) {
        throw new Error('Module config undefined.')
      }
      await updateRemoteSchema(config)
      console.log('Remote test database updated.')
    }
  }

  if (args.noVue === false) {
    // Copy public directory to app root.
    const targetPath = `${AppRoot as unknown as string}/public`
    fse.copySync(path.join(__dirname, '../../public'), targetPath, { overwrite: true })

    // Load configuration in .env file.
    dotenv.config()
    const MODULE_COFNIG: any = {
      API_TOKEN: process.env.API_TOKEN,
      DATABASE: process.env.DATABASE_ID,
      STORAGE: process.env.STORAGE_ID
    }

    // Load default configs.
    if (config.configables !== undefined) {
      MODULE_COFNIG.MYBACK_MODULE_CONFIGS = getDefaultConfigs(config.configables)
    }

    // Write configurations to index.html
    const htmlPath = path.join(targetPath, 'index.html')
    fse.readFile(htmlPath, 'utf8', (err: any, data: string) => {
      if (err != null) {
        console.log(err); return
      }
      const result = data.replace(
        '<!--MODULE_CONFIG-->',
        Object.entries(MODULE_COFNIG).map(([k, v]) => (`window.${k} = ${JSON.stringify(v)}`)).join('\n')
      )

      fse.writeFile(htmlPath, result, 'utf8', (err: any) => {
        if (err != null) console.log(err)
      })
    })

    // Run vue-cli-service
    const vueServicePath = require.resolve('@vue/cli-service/bin/vue-cli-service.js')
    const child = childProcess.fork(vueServicePath, rawArgv)

    child.on('exit', () => {
      if (args._[0] === 'build') {
        console.log('Compiling module.config.ts')
        writeModuleConfig(config)
        console.log('module.config.ts compiled.')
      }
    })
  }
}
main().catch((err) => { throw err })
