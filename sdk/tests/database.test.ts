import { afterAll, beforeAll, expect, test } from '@jest/globals'
import { attribute, Database, Model, QueryBuilder, SDK } from '../src'
import App from '@myback/api-tester'
import { createSQLiteDatabase } from '@myback/api-tester/build/cli'
import { Server } from 'http'

SDK.init({
  API_KEY: 'NOT_REQUIRE_FOR_TESTER',
  ENDPOINT: 'http://localhost:3000',
  VERSION: 'v1',
  DATABASE: 'default'
})

let server: Server | null = null

beforeAll(async () => {
  await createSQLiteDatabase({
    name: 'test',
    description: 'testing',
    models: [Sample]
  })

  server = App.start().server
})

afterAll(() => {
  if (server != null) server.close()
})

class Sample extends Model {
  protected static tableName: string = 'sample2'
  @attribute()
    name?: string

  @attribute()
    age?: number
}

const db = new Database()
const s = new Sample()

test('Test save object', async () => {
  s.name = 'Test name'
  s.age = 20
  await db.save(Sample, s)
  expect((await db.all(Sample)).length).toBe(1)
})

test('Test find object', async () => {
  let query = new QueryBuilder().greaterThan('age', '50')
  expect((await db.find(Sample, query)).length).toBe(0)
  query = new QueryBuilder().lessOrEqualThan('age', '50')
  expect((await db.find(Sample, query)).length).toBe(1)
})

test('Test update object', async () => {
  s.age = 30
  await db.save(Sample, s)
  const vals = await db.all(Sample)
  expect(vals[0].age).toBe(30)
})

test('Test delete object', async () => {
  await db.destroy(Sample, s)
  expect((await db.all(Sample)).length).toBe(0)
})
