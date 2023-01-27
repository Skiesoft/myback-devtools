import { beforeAll, expect, test } from '@jest/globals'
import { Database, QueryBuilder, SDK } from '../src'
import { createSQLiteDatabase } from '../src/test-server/cli'
import { Sample1 } from './models/sample1'
import { Sample2 } from './models/sample2'

SDK.init({
  API_KEY: 'NOT_REQUIRE_FOR_TESTER',
  ENDPOINT: 'http://localhost:3000',
  VERSION: 'v1',
  DATABASE: 'default'
})

beforeAll(async () => {
  await createSQLiteDatabase({
    name: 'test',
    description: 'testing',
    models: [Sample1, Sample2]
  })
})

const db = new Database()
const s = new Sample1()

test('Test save object', async () => {
  s.name = 'Test name'
  s.age = 20
  await db.save(Sample1, s)
  expect((await db.all(Sample1)).length).toBe(1)
})

test('Test find object', async () => {
  let query = new QueryBuilder().greaterThan('age', 50)
  expect((await db.find(Sample1, query)).length).toBe(0)
  query = new QueryBuilder().lessOrEqualThan('age', 50)
  expect((await db.find(Sample1, query)).length).toBe(1)
})

test('Test update object', async () => {
  s.age = 30
  await db.save(Sample1, s)
  const vals = await db.all(Sample1)
  expect(vals[0].age).toBe(30)
})

test('Test delete object', async () => {
  await db.destroy(Sample1, s)
  expect((await db.all(Sample1)).length).toBe(0)
})
