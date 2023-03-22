#!/usr/bin/env ts-node-script

import AppRoot from 'app-root-path'
import minimist from 'minimist'
import { createSQLiteDatabase, getDefaultConfigs } from '../test-server/process-config'
import TestServer from '../test-server'
import { transformModuleConfig } from '../bundle'
import { ModuleConfig } from '../module-config'
import childProcess from 'child_process'
import fse from 'fs-extra'
import path from 'path'

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
    createSQLiteDatabase(config)
    console.log('Test database created.')
  }

  TestServer.start()
}

if (args.noVue !== true) {
  // Copy public directory to app root.
  const targetPath = `${AppRoot as unknown as string}/public`
  fse.copySync(path.join(__dirname, '../../public'), targetPath, { overwrite: true })
  // Write default configs.
  if (config.configables !== undefined) {
    const defaults = getDefaultConfigs(config.configables)
    const htmlPath = path.join(targetPath, 'index.html')
    fse.readFile(htmlPath, 'utf8', (err: any, data: string) => {
      if (err != null) {
        console.log(err); return
      }
      const result = data.replace('<!--MODULE_CONFIG-->', `window.MYBACK_MODULE_CONFIGS = ${JSON.stringify(defaults)}`)

      fse.writeFile(htmlPath, result, 'utf8', (err: any) => {
        if (err != null) console.log(err)
      })
    })
  }

  // Run vue-cli-service
  const vueServicePath = require.resolve('@vue/cli-service/bin/vue-cli-service.js')
  const child = childProcess.fork(vueServicePath, rawArgv)

  child.on('exit', () => {
    if (args._[0] === 'build') {
      console.log('Compiling module.config.ts')
      transformModuleConfig(config)
      console.log('module.config.ts compiled.')
    }
  })
}
