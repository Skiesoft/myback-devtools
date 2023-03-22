import { expect, test } from '@jest/globals'
import { transformModuleConfig } from '../src/bundle'
import { ModuleConfig } from '../src/module-config'
import { Sample1 } from './models/sample1'
import { Sample2 } from './models/sample2'
import fs from 'fs'

test('compile models', () => {
  const config: ModuleConfig = {
    name: 'test',
    description: 'testing',
    models: [Sample1, Sample2]
  }
  transformModuleConfig(config)
  const obj = JSON.parse(fs.readFileSync('dist/module.config.json').toString())
  expect(obj.name).toBe('test')
  expect(obj.description).toBe('testing')
  expect(obj.models.length).toBe(2)
})
